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
import { API_URL } from "@/app/util/constants";
import { Part } from "@/app/util/types";

interface PreviewPost {
  description: string;
  title: string;
  hasImages: boolean;
  videos: string[];
  shipParts: { part: Part; amount: number }[];
  username: string;
  tags: string[];
}

export default function Page() {
  const { state } = useAuth();

  const router = useRouter();

  const [post, setPost] = useState<PreviewPost>({
    description: "",
    title: "",
    hasImages: false,
    videos: [],
    shipParts: [],
    username: "",
    tags: [],
  });

  const {
    res: imagesRes,
    loading: imagesLoading,
    error: imagesError,
    fetchData: getImages,
  } = useRequest<string[]>("GET");

  useEffect(() => {
    setPost(JSON.parse(sessionStorage.getItem("previewPost") || ""));
  }, []);

  useEffect(() => {
    if (post.hasImages && state.user && state.user.username !== "") {
      getImages("", `/images/temp/${state.user.userId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, state.user]);

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Button className="btn-secondary self-start" handleClick={handleBack}>
        Back
      </Button>
      <div className="w-full h-full flex flex-col items-center gap-4">
        <div className="flex items-center flex-col gap-2">
          <h1 className="text-2xl font-bold">{post.title || "Untitled"}</h1>
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
            images={imagesRes ? imagesRes.data : []}
            size="lg"
            preview
            img_prefix={API_URL}
          />
        </div>
        <h2 className="text-2xl font-bold">Description</h2>
        {post.description || "No description"}
        <h2 className="text-2xl font-bold">Videos</h2>
        <div className="flex gap-4 w-full overflow-auto">
          {post.videos.length > 0 ? (
            <>
              {post.videos.map((video, i) => (
                <div key={video + i} className="m-auto">
                  <YoutubeEmbed src={video} />
                </div>
              ))}
            </>
          ) : (
            <p className="m-auto">No videos</p>
          )}
        </div>
        <h2 className="text-2xl font-bold">Ship Parts</h2>
        <div className="w-4/5">
          <FinalPartsTable
            parts={post.shipParts.map((part) => {
              return { partName: part.part.partName, amount: part.amount };
            })}
          />
        </div>
      </div>
    </main>
  );
}
