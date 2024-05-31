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
import { formatNumberWithCommas } from "@/app/util/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDesigns } from "@/app/context/DesignsContext";
import FinalPartsTable from "@/app/components/FinalPartsTable";
import Skeleton from "react-loading-skeleton";
import Button from "@/app/components/Button";
import SubNav from "@/app/components/SubNav";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Link as TippyLink } from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Image as TippyImage } from "@tiptap/extension-image";
import Editor from "@/app/components/editor/Editor";

export default function ViewDesign({ params }: { params: { postId: string } }) {
  const postId = params.postId;

  useEffect(() => {
    sessionStorage.clear();
  }, []);

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
      TippyLink.configure({
        protocols: ["ftp", "mailto"],
        openOnClick: false,
      }),
    ],
  });

  useEffect(() => {
    if (res && editor) {
      editor.commands.setContent(res.data.description);
    }
  }, [res, editor]);

  if (!res && error)
    return (
      <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8">
        <div>Page does not exist</div>
      </main>
    );

  const data = res?.data;

  return (
    <main className="flex min-h-screen flex-col items-center py-12 md:py-24 lg:px-24 md:px-16 px-8 gap-4">
      <div className="flex items-center flex-col gap-1" id="title">
        <h1>{data?.title || <Skeleton height={24} width={240} />}</h1>
        {data ? (
          <Link href={`/users/view/${data.userId.id}/${data.userId.iv}`}>
            {data.username}
          </Link>
        ) : (
          <Skeleton height={16} width={200} />
        )}
      </div>
      <div className="flex gap-2">
        {data ? (
          data.tags.map((tag) => (
            <div key={tag} className="badge badge-outline">
              {tag}
            </div>
          ))
        ) : (
          <Skeleton height={16} width={100} />
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        {data ? (
          <>
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
          </>
        ) : (
          <>
            <Skeleton circle height={30} width={30} />
            <Skeleton width={100} />
          </>
        )}
      </div>
      <div
        className="w-full h-fit flex flex-col justify-center items-center"
        id="images"
      >
        <Carousel
          placeholders={[]}
          autoplay={false}
          images={data?.imageKeys || []}
          size="lg"
          preview
        />
      </div>
      {data ? (
        data.about && (
          <>
            <h2 id="about">About This Design</h2>
            <div className="w-2/3 bg-white shadow rounded-lg p-2">
              <p className="text-center">{data.about}</p>
            </div>
          </>
        )
      ) : (
        <>
          <h2 id="about">About This Design</h2>
          <Skeleton count={2} width={1000} />
        </>
      )}

      {data ? (
        data.description && (
          <>
            <h2 id="description">Description</h2>
            <div className="w-3/4">
              <Editor editable={false} editor={editor} />
            </div>
          </>
        )
      ) : (
        <>
          <h2 id="description">Description</h2>
          <Skeleton count={5} width={1000} />
        </>
      )}
      {data ? (
        data.videos.length > 0 && (
          <>
            <h2 id="videos">Videos</h2>
            <div className="flex gap-4 w-full overflow-auto">
              {data.videos.map((video, i) => (
                <div key={video + i} className="m-auto">
                  <YoutubeEmbed src={video} />
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <>
          <h2 id="videos">Videos</h2>
          <Skeleton height={405} width={720} borderRadius={0} />
        </>
      )}
      {data ? (
        data.shipParts.length > 0 && (
          <>
            <h2 id="parts">Ship Parts</h2>
            <FinalPartsTable parts={data.shipParts} />
          </>
        )
      ) : (
        <>
          <h2 id="parts">Ship Parts</h2>
          <FinalPartsTable parts={[]} />
        </>
      )}
    </main>
  );
}
