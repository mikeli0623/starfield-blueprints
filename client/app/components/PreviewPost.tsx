import React from "react";
import Image from "next/image";
import likeIcon from "../../public/like.svg";
import Carousel from "./Carousel";
import YoutubeEmbed from "../posts/components/YoutubeEmbed";
import { useAuth } from "../context/AuthContext";
import { Part } from "../util/types";
import FinalPartsTable from "./FinalPartsTable";

interface Props {
  title: string;
  tags: string[];
  images: string[];
  description: string;
  videos: string[];
  parts: { part: Part; amount: number }[];
}

const PreviewPost = ({
  title,
  tags,
  images,
  description,
  videos,
  parts,
}: Props) => {
  const { state } = useAuth();

  const username = state.user?.username;

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="flex items-center flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        by {username}
      </div>
      {tags.map((tag) => (
        <div key={tag} className="badge badge-outline">
          {tag}
        </div>
      ))}
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
          images={images}
          size="lg"
          preview
          img_prefix=""
        />
      </div>
      <h2 className="text-2xl font-bold">Description</h2>
      {description}
      <h2 className="text-2xl font-bold">Videos</h2>
      <div className="flex gap-4 w-full overflow-auto">
        {videos.length > 0 ? (
          <>
            {videos.map((video, i) => (
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
          parts={parts.map((part) => {
            return { partName: part.part.partName, amount: part.amount };
          })}
        />
      </div>
    </div>
  );
};

export default PreviewPost;
