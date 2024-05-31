import Image from "next/image";
import Link from "next/link";
import { IMG_URL, SVG_DATA } from "../util/constants";
import { PostResponse } from "../util/types";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import likeIcon from "../../public/like.svg";
import likedIcon from "../../public/liked.svg";
import { formatNumberWithCommas } from "../util/utils";

interface PostProps {
  post: PostResponse;
  handleLike: ((postId: string) => void) | null;
  liked: boolean;
  minimal?: boolean;
}

const PostCard = ({
  post,
  handleLike = null,
  liked = false,
  minimal = false,
}: PostProps) => {
  const date = new Date(post.createdAt);

  const [clicked, setClicked] = useState<boolean>(false);

  const [imageLoading, setImageLoading] = useState<boolean>(true);

  return (
    <div
      className={`card w-full h-auto bg-base-100 rounded-t-none hover:brightness-[0.85] transition-all ${
        !minimal ? "aspect-[4/5]" : "aspect-[10/11]"
      }`}
    >
      <Link href={`/posts/view/${post._id}`}>
        <figure className="relative w-full aspect-video rounded-none">
          {React.createElement(
            "svg",
            {
              ...SVG_DATA,
              style: {
                ...SVG_DATA.style,
                zIndex: 0,
                transform: ["scale(1.5)", SVG_DATA.style.transform].join(" "),
                filter: "blur(40px)",
              },
              className: "z-[-1]",
            },
            JSON.parse(
              post.placeholderSVG?.replaceAll(`fill-opacity`, `fillOpacity`) ||
                "null"
            )?.map((child: any) =>
              React.createElement(child[0], {
                key: [child[1].x, child[1].y].join(","),
                ...child[1],
              })
            )
          )}
          <Image
            src={`${IMG_URL + post.imageKeys[0]}`}
            className={`transition-opacity ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            alt="Main Post Image"
            onLoad={() => setImageLoading(false)}
            fill
          />
        </figure>
      </Link>
      <div className="card-body p-4">
        <Link href={`/posts/view/${post._id}`}>
          <p className="card-title sm:text-[16px] h-12">{post.title}</p>
        </Link>
        <p className="h-36 text-[15px]">{post.about}</p>
        <div className="grid grid-cols-[0.65fr_0.35fr] gap-2">
          <div className="flex flex-col text-xs truncate">
            {!minimal && (
              <p className="truncate text-xs">
                by{" "}
                <Link href={`/users/view/${post.userId.id}/${post.userId.iv}`}>
                  {post.username}
                </Link>
              </p>
            )}
            <p className="text-xs">{date.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center text-xs justify-self-end gap-1">
            <AnimatePresence>
              {liked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0, scale: 1 }}
                  onClick={() => {
                    if (handleLike) {
                      handleLike(post._id);
                      setClicked(!clicked);
                    }
                  }}
                >
                  <Image
                    className={`cursor-pointer`}
                    src={likedIcon}
                    alt="liked"
                    width={28}
                    height={28}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  onClick={() => {
                    if (handleLike) {
                      handleLike(post._id);
                      setClicked(!clicked);
                    }
                  }}
                >
                  <Image
                    className={`cursor-pointer`}
                    src={likeIcon}
                    alt="like"
                    width={28}
                    height={28}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {formatNumberWithCommas(post.likes)}
          </div>
        </div>
        {!minimal && (
          <div className="card-actions justify-end">
            {post.tags.map((tag) => {
              return (
                <div key={tag} className="badge badge-outline text-xs">
                  {tag}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
