"use client";
import React, { use, useEffect, useRef, useState } from "react";
import SearchGroup from "./SearchGroup";
import useRequest from "../hooks/useRequest";
import { motion, AnimatePresence } from "framer-motion";
import { PostResponse, TagOptions, UserResponse } from "../util/types";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useDesigns } from "../context/DesignsContext";

const Posts = () => {
  const [search, setSearch] = useState<string>("");
  const [lockout, setLockout] = useState<boolean>(false);
  const lockoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (!lockout) {
      let query = `?title=${search}`;
      const excludedTags: string[] = [];
      Object.entries(tagOptions).forEach((tag) => {
        const [key, val] = tag;
        if (!val) excludedTags.push(key);
      });
      if (excludedTags.length > 0) query += `&excludedTags=${excludedTags}`;
      query += `&sort=${sort}&time=${time}`;
      fetchData(query);
    }
  }, [search, lockout, tagOptions, fetchData, sort, time]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lockoutTimeout.current) clearTimeout(lockoutTimeout.current);
    setLockout(true);
    setSearch(e.target.value);
    lockoutTimeout.current = setTimeout(() => {
      setLockout(false);
    }, 750);
  };

  const { state } = useAuth();
  const router = useRouter();
  const isLogged = state.user?.loggedIn;

  const { likedDesigns, isDesignLiked, addLikedDesign, removeLikedDesign } =
    useDesigns();

  const handleLike = (postId: string) => {
    if (!isLogged) router.push("/register");
    const liked = isDesignLiked(postId);
    if (liked) {
      removeLikedDesign(postId);
    } else {
      addLikedDesign(postId);
    }
  };

  return (
    <div className="bg-secondary w-full h-screen p-6 flex flex-col items-center">
      <SearchGroup
        handleSearchChange={handleSearchChange}
        setTime={setTime}
        setSort={setSort}
        tagOptions={tagOptions}
        setTagOptions={setTagOptions}
      />
      <AnimatePresence>
        <div className="mt-2 w-full grid grid-cols-4">
          {res ? (
            loading ? (
              <motion.span
                className="loading loading-spinner loading-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : res.data.length === 0 ? (
              <div>No posts</div>
            ) : (
              res.data.map((post) => {
                return (
                  <Post
                    key={post._id}
                    post={post}
                    handleLike={handleLike}
                    liked={isDesignLiked(post._id)}
                  />
                );
              })
            )
          ) : (
            <motion.span
              className="loading loading-dots loading-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Posts;
