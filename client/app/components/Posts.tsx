"use client";
import React, { useEffect, useRef, useState } from "react";
import SearchGroup from "./SearchGroup";
import useRequest from "../hooks/useRequest";
import { motion, AnimatePresence } from "framer-motion";
import { PostResponse, TagOptions } from "../util/types";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useDesigns } from "../context/DesignsContext";
import PostSkeleton from "./skeletons/PostSkeleton";
import { DELAYED_LOADING } from "../util/constants";

const Posts = () => {
  const [search, setSearch] = useState<string>("");
  const { res, loading, error, fetchData } = useRequest<PostResponse[]>(
    "GET",
    `/posts`
  );

  const [tagOptions, setTagOptions] = useState<TagOptions>({
    unmodded: true,
    modded: true,
    glitched: true,
  });

  const [time, setTime] = useState<string>("allTime");
  const [sort, setSort] = useState<string>("likes");

  useEffect(() => {
    let query = `?title=${search}`;
    const excludedTags: string[] = [];
    Object.entries(tagOptions).forEach((tag) => {
      const [key, val] = tag;
      if (!val) excludedTags.push(key);
    });
    if (excludedTags.length > 0) query += `&excludedTags=${excludedTags}`;
    query += `&sort=${sort}&time=${time}`;
    fetchData(query);
  }, [search, tagOptions, fetchData, sort, time]);

  const handleSearchChange = (value: string | number) => {
    setSearch(String(value));
  };

  const { state } = useAuth();
  const router = useRouter();
  const isLogged = state.user?.loggedIn;

  const { isDesignLiked, addLikedDesign, removeLikedDesign } = useDesigns();

  const handleLike = (postId: string) => {
    if (!isLogged) router.push("/register");
    const liked = isDesignLiked(postId);
    if (liked) {
      removeLikedDesign(postId);
    } else {
      addLikedDesign(postId);
    }
  };

  const [delayedLoading, setDelayedLoading] = useState<boolean>(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (res && !loading) {
      timeout = setTimeout(() => setDelayedLoading(false), DELAYED_LOADING);
    }
    return () => clearTimeout(timeout!);
  }, [res, loading]);

  return (
    <div className="bg-secondary w-full h-screen p-6 flex flex-col items-center">
      <SearchGroup
        searchValue={search}
        handleSearchChange={handleSearchChange}
        time={time}
        setTime={setTime}
        sort={sort}
        setSort={setSort}
        tagOptions={tagOptions}
        setTagOptions={setTagOptions}
      />
      <AnimatePresence>
        <div className="mt-2 w-full grid grid-cols-4 gap-4">
          {delayedLoading ? (
            Array(12)
              .fill(null)
              .map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <PostSkeleton />
                </motion.span>
              ))
          ) : res?.data.length === 0 ? (
            <div>No posts</div>
          ) : (
            res?.data.map((post) => {
              return (
                <Post
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  liked={isDesignLiked(post._id)}
                />
              );
            })
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Posts;
