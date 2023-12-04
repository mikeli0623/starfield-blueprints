"use client";
import Carousel from "@/app/components/Carousel";
import useRequest from "@/app/hooks/useRequest";
import { PostResponse } from "@/app/util/types";
import { useEffect, useState } from "react";
import YoutubeEmbed from "../../components/YoutubeEmbed";
import Link from "next/link";
import Image from "next/image";
import likeIcon from "../../../../public/like.svg";
import likedIcon from "../../../../public/liked.svg";
import { useAuth } from "@/app/context/AuthContext";
import { formatNumberWithCommas } from "@/app/util/util";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDesigns } from "@/app/context/DesignsContext";
import FinalPartsTable from "@/app/components/FinalPartsTable";

export default function Page({ params }: { params: { postId: string } }) {
  const postId = params.postId;

  const { state } = useAuth();
  const isLoggedIn = state.user?.loggedIn;
  const { isDesignLiked, removeLikedDesign, addLikedDesign, isUserDesign } =
    useDesigns();

  const { res, loading, error, fetchData } = useRequest<PostResponse>(
    "GET",
    `/posts/find/${postId}`
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [clicked, setClicked] = useState(false);

  const likeModifier = (): number => {
    if (!isLoggedIn) return 0;
    const liked = isDesignLiked(postId);
    if (liked && clicked) {
      return 1;
    } else if (liked && !clicked) {
      return 0;
    } else if (!liked && clicked) {
      return -1;
    } else {
      return 0;
    }
  };

  const router = useRouter();

  if (!res && error)
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <div>Page does not exist</div>
      </main>
    );

  if (!res)
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <div>Skeleton</div>
      </main>
    );

  const { data } = res;

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
      <div className="flex items-center flex-col">
        <h1 className="text-2xl font-bold">{data.title}</h1>

        <Link href={`/users/view/${data.userId.id}/${data.userId.iv}`}>
          by {data.username}
        </Link>
      </div>
      <div className="flex gap-2">
        {data.tags.map((tag) => (
          <div key={tag} className="badge badge-outline">
            {tag}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <AnimatePresence>
          {isLoggedIn && isDesignLiked(postId) ? (
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1 }}
              onClick={() => {
                removeLikedDesign(postId);
                setClicked(!clicked);
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
                if (!isLoggedIn) router.push("/register");
                else {
                  addLikedDesign(postId);
                  setClicked(!clicked);
                }
                // if (handleLike) {
                //   handleLike(post._id, post.likes, !clicked);
                //   setClicked(!clicked);
                // }
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
        {formatNumberWithCommas(data.likes + likeModifier())}
      </div>
      <div className="w-full h-fit flex flex-col justify-center items-center">
        <Carousel autoplay={false} images={data.imageKeys} size="lg" preview />
      </div>
      <h2 className="text-2xl font-bold">Description</h2>
      {data.description}
      <h2 className="text-2xl font-bold">Videos</h2>
      <div className="flex gap-4 w-full overflow-auto">
        {data.videos.length > 0 ? (
          <>
            {data.videos.map((video, i) => (
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
        <FinalPartsTable parts={data.shipParts} />
      </div>
    </main>
  );
}
