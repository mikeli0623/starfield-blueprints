import Image from "next/image";
import Link from "next/link";
import { IMG_URL } from "../util/constants";
import { PostResponse } from "../util/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import likeIcon from "../../public/like.svg";
import likedIcon from "../../public/liked.svg";
import { formatNumberWithCommas } from "../util/util";

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

  return (
    <div
      className={`card w-full bg-base-100 ${
        !minimal ? "h-[500px]" : "h-[440px]"
      }`}
    >
      <Link href={`/posts/view/${post._id}`}>
        <figure className="relative w-full h-56">
          <Image
            src={`${IMG_URL + post.imageKeys[0]}`}
            alt="Main Post Image"
            fill
          />
        </figure>
      </Link>
      <div className="card-body p-5">
        <Link href={`/posts/view/${post._id}`}>
          <h2 className="card-title">{post.title}</h2>
        </Link>
        <p>{post.description}</p>

        <div className="grid grid-cols-[0.65fr_0.35fr] gap-2">
          <div className="flex flex-col text-xs truncate">
            {!minimal && (
              <p className="truncate">
                by{" "}
                <Link href={`/users/view/${post.userId.id}/${post.userId.iv}`}>
                  {post.username}
                </Link>
              </p>
            )}
            <p>{date.toLocaleDateString()}</p>
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
                    alt="likes"
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
                    alt="likes"
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
                <div key={tag} className="badge badge-outline">
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
