"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useRequest from "../../../hooks/useRequest";
import ErrorText from "../../../components/ErrorText";
import Image from "next/image";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import ImagePreview from "../../components/ImagePreview";
import toast from "react-hot-toast";
import { PostResponse, TagOptions } from "@/app/util/types";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { IMG_URL, matcher } from "@/app/util/constants";
import Link from "next/link";
import FullImagePreview from "@/app/components/FullImagePreview";
import shipIcon from "../../../../public/ship.svg";
import expandIcon from "../../../../public/expand.svg";
import deleteIcon from "../../../../public/delete.svg";
import closeIcon from "../../../../public/close.svg";
import useSessionStorage from "@/app/hooks/useSessionStorage";
import InputImage from "@/app/components/form/InputImage";
import { useDropzone } from "react-dropzone";
import YoutubeEmbed from "../../components/YoutubeEmbed";
import { useAuth } from "@/app/context/AuthContext";
import PreviewPost from "@/app/components/PreviewPost";

const validImageTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_TITLE_LENGTH = 50;
const MAX_IMAGES = 5;

interface UploadedImage {
  url: string;
  file: File | null;
}

export default function Page() {
  const router = useRouter();

  const { state } = useAuth();

  useEffect(() => {
    if (!state.user?.loggedIn) router.push("/");
  }, [state, router]);

  const isLoggedIn = state.user?.loggedIn;

  if (!isLoggedIn) router.push("/");

  const [error, setError] = useState<string>("");

  const post = useSessionStorage<PostResponse | null>("editPost");

  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const setOriginal = useCallback(() => {
    if (post) {
      setDescription(post.description);
      setTitle(post.title);
      post.tags.forEach((tag) => {
        setTags((prevTags) => {
          return { ...prevTags, [tag]: true };
        });
      });
      const postImages: UploadedImage[] = [];
      post.imageKeys.forEach((imageKey) => {
        postImages.push({
          url: IMG_URL + imageKey,
          file: null,
        });
      });
      setImages(postImages);
      setDeletedImages([]);
      setYoutubeLinks(post.videos);
    }
  }, [post]);

  useEffect(() => {
    setOriginal();
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
    error: deleteError,
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
  const [description, setDescription] = useState<string>("");
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>("");

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

  // needed to trigger update post useEffect
  const [badCode, setBadCode] = useState<boolean>();

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!post) {
      setError("Something went wrong...");
      return;
    }

    if (images.length === 0) {
      setError("Must have at least 1 image.");
      return;
    }

    if (titleProfanity || descProfanity) return;

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
      imageForm.append("id", post._id);
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
    if ((badCode || (!imageUploading && imageRes)) && post !== null) {
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

      const sameTags = sameArray(post.tags, tagsField);
      const sameImages = sameArray(post.imageKeys, trueImageKeys);
      const sameVideos = sameArray(post.videos, videos);

      if (
        title === post.title &&
        description === post.description &&
        sameTags &&
        sameImages &&
        sameVideos
      ) {
        toast.error("No changes detected", {
          id: toastRef.current,
        });
        setBadCode(false);
        return;
      }

      const postData = {
        title,
        description,
        tags: tagsField,
        imageKeys: trueImageKeys,
        videos,
      };

      updatePost(postData, `/posts/${post._id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badCode, imageUploading, imageRes, updatePost, post]);

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
      post
    ) {
      toast.success("Design saved!", {
        id: toastRef.current,
      });
      router.push("/posts/view/" + post._id);
    }
  }, [
    updateRes,
    updating,
    router,
    post,
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
    setOriginal();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveVideo = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    removeLink: string
  ) => {
    e.preventDefault();
    setYoutubeLinks(youtubeLinks.filter((link) => link !== removeLink));
  };

  const handlePreview = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setPreview(true);
  };

  const [preview, setPreview] = useState(false);

  if (preview) {
    const tagsArray = Object.keys(tags).filter(
      (tag) => tags[tag as keyof TagOptions]
    );

    const imageUrls = Object.values(images).map((image) => image.url);

    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <Button
          className="btn-secondary self-start"
          handleClick={() => setPreview(false)}
        >
          Back
        </Button>
        <PreviewPost
          title={title}
          description={description}
          tags={tagsArray}
          videos={youtubeLinks}
          images={imageUrls}
        />
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center p-24"
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
      <h1 className="text-2xl font-bold mb-4">Upload Ship Design</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full"
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
        <div className="mb-4 form-control w-1/2">
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
        <h2 className="text-2xl">Images</h2>
        <h3>
          Upload up to 5 images to showoff your design. Images must be less than
          5 MB. Must upload at least 1 image. Drag to reorder images.
        </h3>
        {error && <ErrorText text={error} />}
        {imageError && <ErrorText text={imageError} />}
        <InputImage ref={fileInputRef} handleUploadImage={handleUploadImage} />
        <Reorder.Group
          className="grid grid-cols-5 gap-4 w-full h-80 items-center justify-evenly my-4 will-change-transform"
          axis="x"
          values={images}
          onReorder={setImages}
        >
          {images.map((image, index) => {
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
                  className="border border-black w-full h-full flex flex-col m-4"
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
        <h2 className="text-2xl">Videos</h2>
        <p>Link up to 12 YouTube videos to show off your design.</p>
        {linkError && <ErrorText text={linkError} />}
        <div className="my-4">
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
              className="join-item  btn-accent text-white px-4 py-2"
              handleClick={handleYoutubeLinkAdd}
            >
              Add
            </Button>
          </div>
        </div>
        <Reorder.Group
          className="flex gap-4 w-full mb-4 overflow-auto"
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
        <div className="join">
          <Button
            className="join-item btn-neutral text-white font-bold py-2 px-4"
            handleClick={handleRevert}
          >
            Revert
          </Button>
          <Button
            className="join-item btn-neutral text-white font-bold py-2 px-4"
            handleClick={handlePreview}
          >
            Preview
          </Button>
          <Button className="join-item submit btn-neutral text-white font-bold py-2 px-4">
            Confirm
          </Button>
        </div>
      </form>
    </main>
  );
}
