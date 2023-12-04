"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useRequest from "../../hooks/useRequest";
import ErrorText from "../../components/ErrorText";
import Image from "next/image";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import ImagePreview from "../components/ImagePreview";
import toast from "react-hot-toast";
import { Part, PostResponse, TagOptions } from "@/app/util/types";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import FullImagePreview from "@/app/components/FullImagePreview";
import YoutubeEmbed from "../components/YoutubeEmbed";
import shipIcon from "../../../public/ship.svg";
import expandIcon from "../../../public/expand.svg";
import deleteIcon from "../../../public/delete.svg";
import { useDropzone } from "react-dropzone";
import { useDesigns } from "@/app/context/DesignsContext";
import { API_URL, matcher } from "@/app/util/constants";
import closeIcon from "../../../public/close.svg";
import InputImage from "@/app/components/form/InputImage";
import Parts from "@/app/components/Parts";
import { useAuth } from "@/app/context/AuthContext";

const validImageTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_TITLE_LENGTH = 50;
const MAX_IMAGES = 5;

interface UploadedImage {
  url: string;
  file: File | null;
}

export default function Page() {
  const [error, setError] = useState<string>("");

  const { state } = useAuth();

  const {
    res: postRes,
    mutate: uploadPost,
    error: uploadError,
    loading: uploading,
  } = useRequest<PostResponse>("POST", "/posts");

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

  const [files, setFiles] = useState<FileList | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [tags, setTags] = useState<TagOptions>({
    unmodded: true,
    modded: false,
    glitched: false,
  });

  const { addUserDesign } = useDesigns();

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
      let filteredSize = filteredTypes.filter((file) => file.size < 5242880);
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
                  !images.find((image) => image.file?.name === file.name)
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

        // Set the updated previews
        setImages(updatedPreviews);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleRemoveImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    image: UploadedImage
  ) => {
    e.preventDefault();
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
  const [description, setDescription] = useState<string>("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>("");
  const [addedParts, setAddedParts] = useState<
    { part: Part; amount: number }[]
  >([]);

  const {
    res: tempImagesRes,
    loading: tempImagesLoading,
    error: tempImagesError,
    fetchData: getTempImages,
  } = useRequest<string[]>("GET");

  const {
    res: deleteTempRes,
    loading: deletingTemp,
    error: deleteTempError,
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

  useEffect(() => {
    if (sessionStorage.getItem("previewPost") !== null && state && state.user) {
      const post: {
        description: string;
        title: string;
        hasImages: boolean;
        videos: string[];
        shipParts: { part: Part; amount: number }[];
        username: string;
        tags: string[];
      } = JSON.parse(sessionStorage.getItem("previewPost")!);
      setTitle(post.title);
      setDescription(post.description);
      setYoutubeLinks(post.videos);
      setAddedParts(post.shipParts);
      const newTags = {
        unmodded: post.tags.includes("unmodded"),
        modded: post.tags.includes("modded"),
        glitched: post.tags.includes("glitched"),
      };
      setTags(newTags);
      setAddedParts(post.shipParts);
      if (post.hasImages)
        getTempImages("", `/images/temp/${state.user.userId}`);
      sessionStorage.removeItem("previewPost");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (tempImagesRes && !tempImagesError) {
      fetchAndCreateFiles(tempImagesRes.data);
    }
  }, [tempImagesRes, tempImagesError, fetchAndCreateFiles]);

  const [titleProfanity, setTitleProfanity] = useState<boolean>(false);
  const [descProfanity, setDescProfanity] = useState<boolean>(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setTitleProfanity(matcher.hasMatch(inputText));
    if (inputText.length <= MAX_TITLE_LENGTH) {
      setTitle(inputText);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const inputText = e.target.value;
    setDescProfanity(matcher.hasMatch(inputText));
    if (inputText.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(inputText);
    }
  };

  function isValidYouTubeLink(link: string) {
    // Regular expression to match YouTube video URLs
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
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

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Must have at least 1 image.");
      return;
    }

    if (titleProfanity || descProfanity) return;

    const tagsField: string[] = Object.keys(tags).filter(
      (tag) => tags[tag as keyof TagOptions]
    );

    const videos: string[] = youtubeLinks.map(
      (link) => link.split("=").slice(-1)[0]
    );

    const shipParts = addedParts.map((part) => {
      return { partName: part.part.partName, amount: part.amount };
    });

    const postData = {
      title,
      description,
      tags: tagsField,
      videos,
      shipParts,
    };

    toastRef.current = toast.loading("Uploading design...");

    uploadPost(postData);
  };

  const [postId, setPostId] = useState<string>("");

  // create images after post creation
  useEffect(() => {
    if (postRes) {
      const imageForm = new FormData();
      images.forEach((image, index) => {
        if (image.file) {
          imageForm.append(`images[${index}]`, image.file);
        }
      });
      setPostId(postRes.data._id);
      imageForm.append("id", postRes.data._id);
      uploadImage(imageForm);
    }
  }, [postRes, images, uploadImage]);

  // update post with image keys
  useEffect(() => {
    if (!uploading && !imageUploading && postRes && imageRes && postId) {
      updatePost({ imageKeys: imageRes.data.keys }, `/posts/${postId}`);
    }
  }, [uploading, imageUploading, postRes, imageRes, postId, updatePost]);

  const router = useRouter();

  useEffect(() => {
    if (updateError) {
      toast.error(updateError, {
        id: toastRef.current,
      });
    }
  }, [updateError]);

  useEffect(() => {
    if (!updating && updateRes) {
      toast.success("Design uploaded!", {
        id: toastRef.current,
      });
      addUserDesign(postId);
      router.push("/posts/view/" + postId);
    }
  }, [updateRes, updating, router, postId, addUserDesign]);

  interface MET {
    unmodded: "modded";
    modded: "unmodded";
  }

  const MUTUAL_EXCLUSIVE_TAG: MET = {
    unmodded: "modded",
    modded: "unmodded",
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const {
    res: uploadTempImageRes,
    loading: uploadingTempImage,
    error: uploadingTempImageError,
    mutate: uploadTempImage,
  } = useRequest("POST", `/images/temp/${state.user?.userId}`);

  const handlePreview = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const tagsArray = Object.keys(tags).filter(
      (tag) => tags[tag as keyof TagOptions]
    );
    const post = {
      title: title,
      description: description,
      videos: youtubeLinks,
      username: state.user?.username,
      tags: tagsArray,
      shipParts: addedParts,
      hasImages: images.length > 0,
    };
    const imageForm = new FormData();
    images.forEach((image, index) => {
      if (image.file) {
        imageForm.append(`images[${index}]`, image.file);
      }
    });
    uploadTempImage(imageForm);
    sessionStorage.setItem("previewPost", JSON.stringify(post));
    router.push("/posts/preview");
  };

  const handleRemoveVideo = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    removeLink: string
  ) => {
    e.preventDefault();
    setYoutubeLinks(youtubeLinks.filter((link) => link !== removeLink));
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center p-24 gap-4"
      {...getRootProps()}
    >
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
            <h1 className="text-5xl m-auto text-white">Drop images here ...</h1>
          </motion.div>
        )}
      </AnimatePresence>
      <h1 className="text-2xl font-bold">Upload Ship Design</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full gap-4"
      >
        <div className="form-control w-full max-w-xs">
          <label className="label font-medium text-gray-600">
            <span className="label-text text-lg">Title</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full ${
              titleProfanity ? "input-error" : ""
            }`}
            placeholder="Enter title"
            value={title}
            onChange={handleTitleChange}
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
        <div className="form-control w-full">
          <div className="join w-full flex items-center justify-center ">
            {Object.entries(tags).map((tag) => {
              const tagName = tag[0];
              const val = tag[1];
              return (
                <div className="join-item bg-white px-2" key={tagName}>
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
        <div className="form-control w-1/2">
          <label className="label font-medium text-gray-600">
            <span className="label-text text-lg">Description</span>
          </label>
          <textarea
            className={`textarea textarea-bordered h-32 p-2 w-full text-lg ${
              descProfanity ? "textarea-error" : ""
            }`}
            placeholder="Enter description"
            value={description}
            onChange={handleDescriptionChange}
            maxLength={MAX_DESCRIPTION_LENGTH}
            required
          />
          <label className="label text-sm text-gray-500">
            <span className="label-text-alt">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
            {descProfanity && (
              <span className="label-text-alt text-error">
                Profanity detected
              </span>
            )}
          </label>
        </div>
        <div className="form-control w-2/3 flex flex-col items-center gap-2">
          <h2 className="text-2xl">Ship Parts</h2>
          <Parts addedParts={addedParts} setAddedParts={setAddedParts} />
        </div>
        <div className="form-control w-full flex flex-col items-center gap-2">
          <h2 className="text-2xl">Images</h2>
          <p>
            Upload up to 5 images to show off your design. Images must be less
            than 5 MB. Must upload at least 1 image. Drag to reorder images.
          </p>
          {uploadError && <ErrorText text={uploadError} />}
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
                        />
                      </Button>
                      <Button className="btn-circle btn-disabled">
                        <Image
                          src={deleteIcon}
                          alt="delete"
                          width={35}
                          height={35}
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </Reorder.Group>
        </div>
        <div className="form-control w-full flex flex-col items-center gap-2">
          <h2 className="text-2xl">Videos</h2>
          <p>Link up to 12 YouTube videos to show off your design.</p>
          {linkError && <ErrorText text={linkError} />}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              YouTube Links
            </label>
            <div className="join">
              <input
                className="join-item input input-bordered"
                placeholder="Enter YouTube link"
                value={youtubeLinkInput}
                onChange={(e) => setYoutubeLinkInput(e.target.value)}
              />
              <Button
                className="join-item btn-accent text-white px-4 py-2"
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
            handleClick={handlePreview}
          >
            Preview
          </Button>
          <Button className="join-item submit btn-neutral text-white font-bold py-2 px-4">
            Submit
          </Button>
        </div>
      </form>
    </main>
  );
}
