"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
import YoutubeEmbed from "../components/YoutubeEmbed";
import likeIcon from "../../../public/like.svg";
import FinalPartsTable from "@/app/components/FinalPartsTable";
import Carousel from "@/app/components/Carousel";
import { useRouter } from "next/navigation";
import useRequest from "@/app/hooks/useRequest";
import { useAuth } from "@/app/context/AuthContext";
import { PreviewPost } from "@/app/util/types";
import { API_URL } from "@/app/util/constants";
import fullView from "../../../public/full-view.svg";
import cardView from "../../../public/card-view.svg";
import Skeleton from "react-loading-skeleton";
import SubNav from "@/app/components/SubNav";
import Editor from "@/app/components/editor/Editor";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Image as TippyImage } from "@tiptap/extension-image";

export default function PreviewDesign() {
  const { state } = useAuth();

  const router = useRouter();

  const [view, setView] = useState<"full" | "card">("full");

  const [post, setPost] = useState<PreviewPost>({
    description: "",
    title: "",
    about: "",
    hasMulterImages: false,
    videos: [],
    shipParts: [],
    username: "",
    awsImages: [],
    awsImageOrder: [],
    tags: [],
    type: "",
    id: "",
  });

  const {
    res: imagesRes,
    loading: imagesLoading,
    error: imagesError,
    fetchData: getImages,
  } = useRequest<string[]>("GET");

  useEffect(() => {
    if (JSON.parse(sessionStorage.getItem("previewPost")!)) {
      setPost(JSON.parse(sessionStorage.getItem("previewPost")!));
    }
  }, []);

  useEffect(() => {
    if (post.hasMulterImages && state.user && state.user.username !== "") {
      getImages("", `/images/temp/${state.user.userId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, state.user]);

  const handleBack = () => {
    router.push(post.type === "add" ? "/posts/add" : `/posts/edit/${post.id}`);
  };

  const orderImages = () => {
    const images = [];

    let len = 0;
    if (post.awsImages) {
      len += post.awsImages.length;
    }
    if (post.hasMulterImages && imagesRes) {
      len += imagesRes.data.length;
    }

    let [awsIndex, multerIndex] = [0, 0];

    for (let i = 0; i < len; i++) {
      if ((post.awsImageOrder || []).includes(i)) {
        images.push(post.awsImages![awsIndex]);
        awsIndex++;
      } else if (imagesRes) {
        images.push(API_URL + imagesRes.data[multerIndex]);
        multerIndex++;
      }
    }

    return images;
  };

  const editor = useEditor({
    editable: false,
    extensions: [
      TippyImage.configure({
        inline: true,
      }),
      Underline,
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        protocols: ["ftp", "mailto"],
        openOnClick: false,
      }),
    ],
    content: post.description,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(
        post.description === ""
          ? `<p style=\"text-align: center\">No description</p>`
          : post.description
      );
    }
  }, [editor, post]);

  return (
    <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-4">
      <SubNav>
        <Button className="btn-secondary m-auto" handleClick={handleBack}>
          Back
        </Button>
        <ul className="flex flex-row gap-2 m-auto">
          <li>
            <Button className="btn-circle" handleClick={() => setView("full")}>
              <Image src={fullView} alt="full view" width={30} height={30} />
            </Button>
          </li>
          <li>
            <Button className="btn-circle" handleClick={() => setView("card")}>
              <Image src={cardView} alt="card view" width={30} height={30} />
            </Button>
          </li>
        </ul>
      </SubNav>
      {view === "full" && (
        <div className="w-full h-full flex flex-col items-center gap-4">
          <div className="flex items-center flex-col gap-2">
            <h1>{post.title || "Untitled"}</h1>
            by {post.username}
          </div>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <div key={tag} className="badge badge-outline">
                {tag}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Image
              className={`cursor-pointer`}
              src={likeIcon}
              alt="likes"
              width={28}
              height={28}
            />
            0
          </div>
          <div className="w-full h-fit flex flex-col justify-center items-center">
            <Carousel
              autoplay={false}
              images={orderImages()}
              placeholders={[]}
              size="lg"
              preview
              img_prefix=""
              emptyText="Not seeing your images? Click the `Preview` button on the previous page after they are uploaded."
            />
          </div>
          <h2>About This Design</h2>
          <div className="w-2/3">
            <p className="max-h-32 text-[15px] text-center break-words">
              {post.about || "No about"}
            </p>
          </div>
          {post.description && (
            <>
              <h2>Description</h2>
              <div className="w-3/4">
                <Editor editable={false} editor={editor} />
              </div>
            </>
          )}
          {post.videos.length > 0 && (
            <>
              <h2>Videos</h2>
              <div className="flex gap-4 w-full overflow-auto">
                {post.videos.map((video, i) => (
                  <div key={video + i} className="m-auto">
                    <YoutubeEmbed src={video} />
                  </div>
                ))}
              </div>
            </>
          )}
          {post.shipParts.length > 0 && (
            <>
              <h2>Ship Parts</h2>
              <FinalPartsTable
                parts={post.shipParts.map((part) => {
                  return { partName: part.part.partName, amount: part.amount };
                })}
              />
            </>
          )}
        </div>
      )}
      {view === "card" && (
        <div className="bg-base-200 p-4">
          <div className={`card w-[400px] bg-base-100 ${"h-[500px]"} shadow`}>
            <figure className="relative w-full h-56">
              {orderImages().length > 0 ? (
                <Image src={orderImages()[0]} alt="Main Post Image" fill />
              ) : (
                <Skeleton width={400} height={250} />
              )}
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title">{post.title}</h2>
              <p className="max-h-32 text-[15px]">{post.about}</p>
              <div className="grid grid-cols-[0.65fr_0.35fr] gap-2">
                <div className="flex flex-col text-xs truncate">
                  <p className="truncate">by {post.username}</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center text-xs justify-self-end gap-1">
                  <Image
                    className={`cursor-pointer`}
                    src={likeIcon}
                    alt="likes"
                    width={28}
                    height={28}
                  />

                  {0}
                </div>
              </div>
              <div className="card-actions justify-end">
                {post.tags.map((tag) => {
                  return (
                    <div key={tag} className="badge badge-outline">
                      {tag}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
