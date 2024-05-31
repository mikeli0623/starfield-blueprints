"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useRequest from "../../../hooks/useRequest";
import ErrorText from "../../../components/ErrorText";
import Image from "next/image";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import ImagePreview from "../../components/ImagePreview";
import toast from "react-hot-toast";
import { Part, PostResponse, TagOptions } from "@/app/util/types";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import {
  API_URL,
  IMG_URL,
  MAX_ABOUT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES,
  MAX_TITLE_LENGTH,
  json,
  matcher,
  validImageTypes,
} from "@/app/util/constants";
import FullImagePreview from "@/app/components/FullImagePreview";
import shipIcon from "../../../../public/ship.svg";
import expandIcon from "../../../../public/expand.svg";
import deleteIcon from "../../../../public/delete.svg";
import closeIcon from "../../../../public/close.svg";
import InputImage from "@/app/components/form/InputImage";
import { useDropzone } from "react-dropzone";
import YoutubeEmbed from "../../components/YoutubeEmbed";
import { useAuth } from "@/app/context/AuthContext";
import Parts from "@/app/components/Parts";
import { formatNumberWithCommas, sanitizeHTML } from "@/app/util/utils";
import useProtected from "@/app/hooks/useProtected";
import { useEditor } from "@tiptap/react";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Paragraph from "@tiptap/extension-paragraph";
import { Image as TippyImage } from "@tiptap/extension-image";
import Editor from "@/app/components/editor/Editor";
import LinkModal from "@/app/components/editor/LinkModal";
import { ImageModal } from "@/app/components/editor/ImageModal";

interface UploadedImage {
  url: string;
  file: File | null;
}

export default function EditDesign({ params }: { params: { postId: string } }) {
  const postId = params.postId;

  useProtected();

  const editor = useEditor({
    onUpdate: () => {
      setDescProfanity(matcher.hasMatch(editor?.getText()));
    },
    extensions: [
      Underline,
      TippyImage.configure({
        inline: true,
      }),
      StarterKit.configure({
        code: false,
        codeBlock: false,
        paragraph: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Paragraph.extend({
        addKeyboardShortcuts() {
          return {
            Tab: () => {
              this.editor
                .chain()
                .sinkListItem("listItem")
                .command(({ tr }) => {
                  tr.insertText("    ");

                  return true;
                })
                .run();

              return true; // <- make sure to return true to prevent the tab from blurring.
            },
          };
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.extend({
        inclusive: false,
      }).configure({
        protocols: ["ftp", "mailto"],
        openOnClick: false,
      }),
      CharacterCount.configure({
        limit: MAX_DESCRIPTION_LENGTH,
      }),
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder: "Enter a description",
      }),
    ],
  });

  const router = useRouter();

  const { state } = useAuth();

  const {
    res: checkRes,
    loading: checkLoading,
    error: checkError,
    fetchData: checkUser,
  } = useRequest("GET", `/posts/checkUser/${postId}`);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (checkRes && !checkLoading && !checkRes.data) {
      setTimeout(() => router.push("/"), 1000);
    }
  }, [checkRes, router, checkLoading]);

  const {
    res: postRes,
    // loading,
    error: postError,
    fetchData: fetchPost,
  } = useRequest<PostResponse>("GET", `/posts/find/${postId}`);

  useEffect(() => {
    if (checkRes?.data && !checkError) {
      fetchPost();
    }
  }, [checkError, checkRes, fetchPost]);

  const [originalPost, setOriginalPost] = useState<PostResponse | undefined>();

  useEffect(() => {
    if (postRes && !postError) {
      setOriginalPost(postRes.data);
    }
  }, [postError, postRes]);

  const [error, setError] = useState<string>("");

  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const setOriginal = useCallback(() => {
    if (originalPost && editor) {
      editor.commands.setContent(originalPost.description);
      setTitle(originalPost.title);
      setAbout(originalPost.about);
      originalPost.tags.forEach((tag) => {
        setTags((prevTags) => {
          return { ...prevTags, [tag]: true };
        });
      });
      const postImages: UploadedImage[] = [];
      originalPost.imageKeys.forEach((imageKey) => {
        postImages.push({
          url: IMG_URL + imageKey,
          file: null,
        });
      });
      setImages(postImages);
      setDeletedImages([]);
      setYoutubeLinks(originalPost.videos);
      setAddedParts(
        originalPost.shipParts.map((shipPart) => {
          return {
            part: json.getPart(shipPart.partName),
            amount: shipPart.amount,
          };
        })
      );
    }
  }, [originalPost, editor]);

  useEffect(() => {
    if (!sessionStorage.getItem("previewPost")) setOriginal();
    // else sessionStorage.removeItem("previewPost");
  }, [setOriginal]);

  const {
    res: imageRes,
    mutate: uploadImage,
    error: imageError,
    loading: imageUploading,
  } = useRequest<{ keys: string[] }>("POST", "/images");

  const {
    res: updateRes,
    mutate: updatePost,
    error: updateError,
    loading: updating,
  } = useRequest<PostResponse>("PUT");

  const {
    res: deleteRes,
    fetchData: deleteImages,
    // error: deleteError,
    loading: deletingImages,
  } = useRequest("DELETE");

  const [files, setFiles] = useState<FileList | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [tags, setTags] = useState<TagOptions>({
    unmodded: true,
    modded: false,
    glitched: false,
  });

  const handleUploadImage = useCallback(
    async (e: any) => {
      setError("");

      const target = e.target as HTMLInputElement & {
        files: FileList;
      };

      if (!target.files) return;

      if (images.length === 5) {
        setError("Already have 5 images.");
        return;
      }

      let actualFiles = [];
      for (let i = 0; i < target.files.length; i++) {
        actualFiles.push(target.files[i]);
      }

      const len = actualFiles.length;

      let filteredTypes = actualFiles.filter((file) =>
        validImageTypes.includes(file.type)
      );
      if (filteredTypes.length < len) {
        setError("Image must be in PNG, JPG or WEBP format.");
        return;
      }
      let filteredSize = filteredTypes.filter((file) => file.size < 5000000);
      if (filteredSize.length < len) {
        setError("Image exceeds 5 MB.");
        return;
      }

      setFiles(target.files);
    },
    [images.length]
  );

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      const e = { target: { files: acceptedFiles } };
      handleUploadImage(e);
    },
    [handleUploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
  });

  useEffect(() => {
    if (files && files.length > 0) {
      const filePromises: Promise<UploadedImage>[] = [];
      const newImages: UploadedImage[] = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file) {
          filePromises.push(
            new Promise<UploadedImage>((resolve) => {
              const fileReader = new FileReader();
              fileReader.onload = () => {
                if (
                  fileReader.result &&
                  typeof fileReader.result === "string" &&
                  !images.find((image) => image.url === fileReader.result)
                ) {
                  resolve({ url: fileReader.result, file: files[i] });
                } else {
                  resolve({ url: "", file: null });
                }
              };
              fileReader.readAsDataURL(file);
            })
          );
        } else {
          filePromises.push(Promise.resolve({ url: "", file: null }));
        }
      }

      Promise.all(filePromises).then((results) => {
        // Filter out empty strings from results
        const validPreviews = results.filter(
          (result) => result.url !== "" && result.file !== null
        );

        // Combine existing previews with new valid previews
        const updatedPreviews = [...newImages, ...validPreviews].slice(
          0,
          MAX_IMAGES
        );

        if (awsImages.length > 0) {
          const res = [...updatedPreviews];
          awsOrder.forEach((index, i) => {
            const src = awsImages[i];
            res.splice(index, 0, { url: src, file: null });
          });
          setAwsImages([]);
          setAwsOrder([]);
          setImages(res);
        } else {
          setImages(updatedPreviews);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleRemoveImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    image: UploadedImage
  ) => {
    e.preventDefault();
    if (!image.file)
      setDeletedImages((prev) => [
        ...prev,
        encodeURIComponent(image.url.replace(IMG_URL, "")),
      ]);

    setImages(images.filter((prev) => !(prev.url === image.url)));
  };

  const [previewImage, setPreviewImage] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handlePreviewImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    image: UploadedImage
  ) => {
    e.preventDefault();
    setPreviewImage(image.url);
    setShowPreview(true);
  };

  const handleClosePreview = () => setShowPreview(false);

  const [title, setTitle] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>("");
  const [addedParts, setAddedParts] = useState<
    { part: Part; amount: number }[]
  >([]);

  const {
    res: tempImagesRes,
    // loading: tempImagesLoading,
    error: tempImagesError,
    fetchData: getTempImages,
  } = useRequest<string[]>("GET");

  const {
    // res: deleteTempRes,
    // loading: deletingTemp,
    // error: deleteTempError,
    fetchData: deleteTempImages,
  } = useRequest("DELETE");

  const fetchAndCreateFiles = useCallback(
    async (imageUrls: string[]) => {
      try {
        const filePromises = imageUrls.map(async (url) => {
          const response = await fetch(API_URL + url);
          const [fullName, ext] = url.split(".");
          const name = fullName.split("/").pop();
          const blob = await response.blob();
          const fileName = `${name}.${ext}`;
          return new File([blob], fileName, { type: `image/${ext}` });
        });

        const tempFiles = await Promise.all(filePromises);

        const fileList = new DataTransfer();

        tempFiles.forEach((file) => {
          fileList.items.add(file);
        });

        setFiles(fileList.files);
        deleteTempImages("", `/images/temp/${state.user?.userId}`);
      } catch (error: any) {
        setError(error);
      }
    },
    [deleteTempImages, state.user]
  );

  const [awsImages, setAwsImages] = useState<string[]>([]);
  const [awsOrder, setAwsOrder] = useState<number[]>([]);

  useEffect(() => {
    if (
      sessionStorage.getItem("previewPost") !== null &&
      state &&
      state.user &&
      editor
    ) {
      const previewPost: {
        description: string;
        title: string;
        about: string;
        hasMulterImages: boolean;
        videos: string[];
        awsImageOrder: number[];
        awsImages: string[];
        shipParts: { part: Part; amount: number }[];
        username: string;
        tags: string[];
        type: string;
      } = JSON.parse(sessionStorage.getItem("previewPost")!);
      if (previewPost.type !== "edit") {
        sessionStorage.removeItem("previewPost");
        return;
      }
      setTitle(previewPost.title);
      setAbout(previewPost.about);
      editor.commands.setContent(previewPost.description);
      setYoutubeLinks(previewPost.videos);
      setAddedParts(previewPost.shipParts);
      const previewTags = {
        unmodded: previewPost.tags.includes("unmodded"),
        modded: previewPost.tags.includes("modded"),
        glitched: previewPost.tags.includes("glitched"),
      };
      setTags(previewTags);
      setAddedParts(previewPost.shipParts);
      if (previewPost.hasMulterImages) {
        setAwsImages(previewPost.awsImages);
        setAwsOrder(previewPost.awsImageOrder);
        getTempImages("", `/images/temp/${state.user.userId}`);
      } else {
        const imgs: UploadedImage[] = [];
        previewPost.awsImages.forEach((image) =>
          imgs.push({ url: image, file: null })
        );
        setImages(imgs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, editor]);

  useEffect(() => {
    if (tempImagesRes && !tempImagesError) {
      fetchAndCreateFiles(tempImagesRes.data);
    }
  }, [tempImagesRes, tempImagesError, fetchAndCreateFiles]);

  const [titleProfanity, setTitleProfanity] = useState<boolean>(false);
  const [aboutProfanity, setAboutProfanity] = useState<boolean>(false);
  const [descProfanity, setDescProfanity] = useState<boolean>(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setTitleProfanity(matcher.hasMatch(inputText));
    if (inputText.length <= MAX_TITLE_LENGTH) {
      setTitle(inputText);
    }
  };

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    setAboutProfanity(matcher.hasMatch(inputText));
    if (inputText.length <= MAX_ABOUT_LENGTH) {
      setAbout(inputText);
    }
  };

  function isValidYouTubeLink(link: string) {
    // Regular expression to match YouTube video URLs
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    return regex.test(link);
  }

  const [linkError, setLinkError] = useState("");

  const handleYoutubeLinkAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLinkError("");
    if (!youtubeLinkInput) return;
    if (!isValidYouTubeLink(youtubeLinkInput)) {
      setLinkError(
        'Links should be in the form: https://www.youtube.com/watch?v="VIDEO_ID"'
      );
      return;
    }
    if (youtubeLinks.includes(youtubeLinkInput)) {
      setLinkError("Links should be unique");
      return;
    }
    if (youtubeLinks.length === 12) {
      setLinkError("Max 12 videos");
      return;
    }
    setYoutubeLinks([...youtubeLinks, youtubeLinkInput]);
    setYoutubeLinkInput("");
  };

  const toastRef = useRef<string>();

  // needed to trigger update post useEffect
  const [badCode, setBadCode] = useState<boolean>();

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!originalPost) {
      setError("Something went wrong...");
      return;
    }

    if (images.length === 0) {
      setError("Must have at least 1 image.");
      return;
    }

    if (titleProfanity || descProfanity || aboutProfanity) return;

    if (images.length === 0) {
      setError("Must have at least 1 image!");
      return;
    }

    toastRef.current = toast.loading("Saving design...");

    const imageForm = new FormData();
    const newImages = images.filter((image) => image.file !== null);

    if (newImages.length > 0) {
      newImages.forEach((image, index) => {
        if (image.file) {
          imageForm.append(`images[${index}]`, image.file);
        }
      });
      imageForm.append("id", originalPost._id);
      uploadImage(imageForm);
    }

    if (deletedImages.length > 0)
      deleteImages("", `/images/${deletedImages.join(",")}`);

    setBadCode(true);
  };

  const sameArray = (a1: any[], a2: any[]) => {
    return JSON.stringify(a1) === JSON.stringify(a2);
  };

  // update post
  useEffect(() => {
    if (!originalPost) return;

    if ((badCode || (!imageUploading && imageRes)) && originalPost !== null) {
      const tagsField: string[] = Object.keys(tags).filter(
        (tag) => tags[tag as keyof TagOptions]
      );

      // replace existing images already uploaded to S3 with their keys, and replace new images with their keys
      let i = 0;
      const trueImageKeys: string[] = imageRes
        ? images.map((image) => {
            if (image.file === null) return image.url.replace(IMG_URL, "");
            return imageRes.data.keys[i++];
          })
        : images.map((image) => image.url.replace(IMG_URL, ""));

      const videos: string[] = youtubeLinks.map(
        (link) => link.split("=").slice(-1)[0]
      );

      const sameTags = sameArray(originalPost.tags, tagsField);
      const sameImages = sameArray(originalPost.imageKeys, trueImageKeys);
      const sameVideos = sameArray(originalPost.videos, videos);
      const sameParts = sameArray(
        originalPost.shipParts.map((shipPart) => {
          return {
            part: json.getPart(shipPart.partName),
            amount: shipPart.amount,
          };
        }),
        addedParts
      );

      const shipParts = addedParts.map((part) => {
        return { partName: part.part.partName, amount: part.amount };
      });

      if (
        title === originalPost.title &&
        about === originalPost.about &&
        (originalPost.description === ""
          ? (editor?.getText() || "") === ""
          : sanitizeHTML(editor?.getHTML() || "") ===
            originalPost.description) &&
        sameTags &&
        sameImages &&
        sameVideos &&
        sameParts
      ) {
        toast.error("No changes detected", {
          id: toastRef.current,
        });
        setBadCode(false);
        return;
      }

      const postData = {
        title,
        about,
        description:
          (editor?.storage.characterCount.characters() ?? 0) === 0
            ? ""
            : sanitizeHTML(editor?.getHTML() || ""),
        tags: tagsField,
        imageKeys: trueImageKeys,
        videos,
        shipParts,
      };

      updatePost(postData, `/posts/${originalPost._id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badCode, imageUploading, imageRes, updatePost, originalPost]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError, {
        id: toastRef.current,
      });
    }
  }, [updateError]);

  useEffect(() => {
    if (
      !updating &&
      updateRes &&
      (deletedImages.length === 0 || (!deletingImages && deleteRes)) &&
      originalPost
    ) {
      toast.success("Design saved!", {
        id: toastRef.current,
      });
      router.push("/posts/view/" + originalPost._id);
    }
  }, [
    updateRes,
    updating,
    router,
    originalPost,
    deletedImages,
    deleteRes,
    deletingImages,
  ]);

  interface MET {
    unmodded: "modded";
    modded: "unmodded";
  }

  const MUTUAL_EXCLUSIVE_TAG: MET = {
    unmodded: "modded",
    modded: "unmodded",
  };

  const handleRevert = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    sessionStorage.removeItem("previewPost");
    setOriginal();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    // res: uploadTempImageRes,
    // loading: uploadingTempImage,
    // error: uploadingTempImageError,
    mutate: uploadTempImage,
  } = useRequest("POST", `/images/temp/${state.user?.userId}`);

  const handlePreview = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const tagsArray = Object.keys(tags).filter(
      (tag) => tags[tag as keyof TagOptions]
    );

    const awsImageOrder: number[] = [];

    images.forEach((image, i) => {
      if (!image.file) awsImageOrder.push(i);
    });

    const post = {
      title,
      about,
      description:
        (editor?.storage.characterCount.characters() ?? 0) === 0
          ? ""
          : sanitizeHTML(editor?.getHTML() || ""),
      videos: youtubeLinks,
      username: state.user?.username,
      tags: tagsArray,
      shipParts: addedParts,
      awsImageOrder,
      awsImages: images
        .filter((image) => !image.file)
        .map((image) => image.url),
      hasMulterImages: images.filter((image) => image.file).length > 0,
      type: "edit",
      id: postId,
    };
    sessionStorage.setItem("previewPost", JSON.stringify(post));

    // uploads images through multer for preview
    if (images.filter((image) => !!image.file).length > 0) {
      const imageForm = new FormData();
      images.forEach((image, index) => {
        if (image.file) {
          imageForm.append(`images[${index}]`, image.file);
        }
      });
      uploadTempImage(imageForm);
    }

    router.push("/posts/preview");
  };

  const handleRemoveVideo = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    removeLink: string
  ) => {
    e.preventDefault();
    setYoutubeLinks(youtubeLinks.filter((link) => link !== removeLink));
  };

  if (!checkRes || checkLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-2">
        <span className="loading loading-ring loading-lg" />
      </main>
    );
  }

  if (checkRes && !checkLoading && !checkRes.data) {
    return (
      <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-2">
        Not authorized
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-2"
      {...getRootProps()}
    >
      <LinkModal
        editor={editor}
        link={editor?.getAttributes("link").href ?? ""}
      />
      <ImageModal editor={editor} />
      <Button
        className="join-item btn-neutral text-white font-bold py-2 px-4 self-end"
        handleClick={handlePreview}
      >
        Preview
      </Button>
      <input {...getInputProps()} />
      <AnimatePresence>
        {showPreview && (
          <FullImagePreview
            onClose={handleClosePreview}
            imageUrl={previewImage}
          />
        )}
        {isDragActive && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/60 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0 }}
          >
            <h1 className="m-auto text-white">Drop images here ...</h1>
          </motion.div>
        )}
      </AnimatePresence>
      <h1>Edit Ship Design</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full gap-4"
      >
        <div className="form-control lg:w-1/3 md:w-1/2 w-full">
          <label className="label font-medium text-gray-600">
            <span className="label-text text-lg">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`bg-white input input-bordered shadow w-full ${
              titleProfanity ? "input-error" : ""
            }`}
            placeholder="Enter title"
            required
          />
          <label className="label text-sm text-gray-500">
            <span className="label-text-alt">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
            {titleProfanity && (
              <span className="label-text-alt text-error">
                Profanity detected
              </span>
            )}
          </label>
        </div>
        <div className="form-control lg:w-2/3 md:w-4/5 w-full">
          <label className="label font-medium text-gray-600">
            <span className="label-text text-lg">About this Design</span>
          </label>
          <textarea
            value={about}
            onChange={handleAboutChange}
            className={`textarea textarea-bordered bg-white shadow w-full ${
              aboutProfanity ? "input-error" : ""
            }`}
            placeholder=""
          />
          <label className="label text-sm text-gray-500">
            <span className="label-text-alt">
              {about.length}/{MAX_ABOUT_LENGTH}
            </span>
            {aboutProfanity && (
              <span className="label-text-alt text-error">
                Profanity detected
              </span>
            )}
          </label>
        </div>
        <div className="form-control w-full max-w-xs">
          <div className="join">
            {Object.entries(tags).map((tag) => {
              const tagName = tag[0];
              const val = tag[1];
              return (
                <div
                  className="form-control join-item bg-white px-2"
                  key={tagName}
                >
                  <label className="label cursor-pointer h-full w-full gap-2">
                    <span className="label-text">
                      {tagName.charAt(0).toUpperCase() + tagName.slice(1)}
                    </span>
                    <input
                      type="checkbox"
                      checked={tags[tagName as keyof TagOptions]}
                      className="checkbox"
                      onChange={() => {
                        if (MUTUAL_EXCLUSIVE_TAG[tagName as keyof MET]) {
                          setTags({
                            ...tags,
                            [tagName]: !val,
                            [MUTUAL_EXCLUSIVE_TAG[tagName as keyof MET]]: val,
                          });
                        } else {
                          setTags({
                            ...tags,
                            [tagName]: !val,
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        <div className="form-control lg:w-2/3 md:w-4/5 w-full">
          <label className="label font-medium text-gray-600">
            <span className="label-text text-lg">Description</span>
          </label>
          <Editor editor={editor} />
          <label className="label text-sm text-gray-500">
            <span className="label-text-alt">
              {formatNumberWithCommas(
                editor?.storage.characterCount.characters() ?? 0
              )}
              /{formatNumberWithCommas(MAX_DESCRIPTION_LENGTH)}
            </span>
            {descProfanity && (
              <span className="label-text-alt text-error">
                Profanity detected
              </span>
            )}
          </label>
        </div>
        <div className="form-control w-2/3 flex flex-col items-center gap-2">
          <h2>Ship Parts</h2>
          <Parts addedParts={addedParts} setAddedParts={setAddedParts} />
        </div>
        <div className="form-control w-full flex flex-col items-center gap-2">
          <h2>Images</h2>
          <p>
            Upload up to 5 images to showoff your design. Images must be less
            than 5 MB. Must upload at least 1 image. Drag to reorder images.
          </p>
          {error && <ErrorText text={error} />}
          {imageError && <ErrorText text={imageError} />}
          <InputImage
            ref={fileInputRef}
            handleUploadImage={handleUploadImage}
          />
          <Reorder.Group
            className="grid grid-cols-5 gap-4 w-full h-80 items-center justify-evenly will-change-transform"
            axis="x"
            values={images}
            onReorder={setImages}
          >
            {images.map((image) => {
              return (
                <ImagePreview
                  image={image}
                  key={image.url}
                  handleRemoveImage={handleRemoveImage}
                  handlePreviewImage={handlePreviewImage}
                />
              );
            })}
            {Array(MAX_IMAGES - images.length)
              .fill(null)
              .map((_, i) => {
                return (
                  <div
                    key={i}
                    className="border border-black w-full h-full flex flex-col m-4 cursor-pointer"
                    onClick={handleDivClick}
                  >
                    <div className="w-full h-3/4 flex items-center justify-center relative">
                      <Image
                        src={shipIcon}
                        className="select-none"
                        alt={`placeholder`}
                        width={50}
                        height={50}
                        draggable={false}
                      />
                    </div>
                    <div className="flex p-4 items-center justify-evenly bg-slate-300 border-t-[1px] border-t-black grow">
                      <Button className="btn-circle btn-disabled">
                        <Image
                          src={expandIcon}
                          alt="edit"
                          width={35}
                          height={35}
                          draggable={false}
                        />
                      </Button>
                      <Button className="btn-circle btn-disabled">
                        <Image
                          src={deleteIcon}
                          alt="delete"
                          width={35}
                          height={35}
                          draggable={false}
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </Reorder.Group>
        </div>
        <div className="form-control w-full flex flex-col items-center gap-2">
          <h2>Videos</h2>
          <p>Link up to 12 YouTube videos to show off your design.</p>
          {linkError && <ErrorText text={linkError} />}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              YouTube Links
            </label>
            <div className="join shadow">
              <input
                className="join-item input input-bordered bg-white"
                placeholder="Enter YouTube link"
                value={youtubeLinkInput}
                onChange={(e) => setYoutubeLinkInput(e.target.value)}
              />
              <Button
                className="join-item  btn-accent text-white px-4 py-2"
                handleClick={handleYoutubeLinkAdd}
              >
                Add
              </Button>
            </div>
          </div>
          <Reorder.Group
            className="flex gap-4 w-full overflow-auto"
            axis="x"
            values={youtubeLinks}
            onReorder={setYoutubeLinks}
          >
            {youtubeLinks.map((link, i) => (
              <Reorder.Item
                key={link}
                value={link}
                className="flex flex-col m-auto"
              >
                <div className="w-full flex justify-between items-center py-2 px-4 bg-slate-300 rounded-t-xl ">
                  <p className="font-medium">Video {i + 1}</p>
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={(e) => handleRemoveVideo(e, link)}
                  >
                    <Image src={closeIcon} alt="close" width={40} height={40} />
                  </button>
                </div>
                <YoutubeEmbed src={link} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
        <div className="join">
          <Button
            className="join-item btn-neutral text-white font-bold py-2 px-4"
            handleClick={handleRevert}
          >
            Undo All
          </Button>
          <Button
            className="join-item btn-neutral text-white font-bold py-2 px-4"
            handleClick={handlePreview}
          >
            Preview
          </Button>
          <Button className="join-item submit btn-neutral text-white font-bold py-2 px-4">
            Save Changes
          </Button>
        </div>
      </form>
    </main>
  );
}
