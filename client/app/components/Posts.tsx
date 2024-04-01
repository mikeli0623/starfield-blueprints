"use client";
import React, { useEffect, useState } from "react";
import SearchGroup from "./SearchGroup";
import { motion, AnimatePresence } from "framer-motion";
import { PostResponse, TagOptions } from "../util/types";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useDesigns } from "../context/DesignsContext";
import PostSkeleton from "./skeletons/PostSkeleton";
import { API_URL, PAGE_SIZE } from "../util/constants";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePageVisibility } from "react-page-visibility";

const Posts = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState<string>("");

  const { ref, inView } = useInView();

  const [query, setQuery] = useState<string>("");

  const [tagOptions, setTagOptions] = useState<TagOptions>({
    unmodded: true,
    modded: true,
    glitched: true,
  });

  const [time, setTime] = useState<string>("allTime");
  const [sort, setSort] = useState<string>("likes");

  // useEffect to update the query when search, tagOptions, sort, or time changes
  useEffect(() => {
    let query = `?title=${search}`;
    const excludedTags: string[] = [];
    Object.entries(tagOptions).forEach((tag) => {
      const [key, val] = tag;
      if (!val) excludedTags.push(key);
    });
    if (excludedTags.length > 0) query += `&excludedTags=${excludedTags}`;
    query += `&sort=${sort}&time=${time}`;

    // Invalidate and refetch the data when the query changes
    // queryClient.invalidateQueries({ queryKey: ["posts", query] });

    setQuery(query);
  }, [queryClient, search, sort, tagOptions, time]);

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<PostResponse[]>({
    queryKey: ["posts", query],
    queryFn: async ({ pageParam }) => {
      const res = await axios.get(
        `${API_URL}/posts${query}&page=${pageParam}&pageSize=${PAGE_SIZE}`
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.length > 0 ? (lastPage[0].page ?? 0) + 1 : undefined;
    },
  });

  const isVisible = usePageVisibility();

  const [lostVisibility, setLostVisiblity] = useState<boolean>(false);

  useEffect(() => {
    if (!isVisible) {
      setLostVisiblity(true);
    }
    if (isVisible)
      setTimeout(() => {
        setLostVisiblity(false);
      }, 500);
  }, [isVisible]);

  useEffect(() => {
    if (inView && isVisible && !lostVisibility) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isVisible, lostVisibility]);

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

  return (
    <div className="bg-secondary w-full min-h-[600px] h-fit p-6 flex flex-col items-center gap-4">
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
        <motion.div className="w-full grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-4">
          {status === "pending" ? (
            Array(4)
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
          ) : status === "error" ? (
            <span>Error: {error.message}</span>
          ) : (
            <>
              {data.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.map((post) => (
                    <Post
                      key={post._id}
                      post={post}
                      handleLike={handleLike}
                      liked={isDesignLiked(post._id)}
                    />
                  ))}
                </React.Fragment>
              ))}
              {hasNextPage && !isFetchingNextPage && (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-4 m-auto"
                >
                  <button ref={ref} onClick={() => fetchNextPage()}>
                    {isFetchingNextPage ? (
                      <span className="loading loading-spinner loading-lg" />
                    ) : hasNextPage ? (
                      "Load More"
                    ) : (
                      ""
                    )}
                  </button>
                </motion.div>
              )}
              {isFetching && !isFetchingNextPage
                ? Array(4)
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
                : null}
            </>
          )}
        </motion.div>
      </AnimatePresence>
      {/* <SearchGroup
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
        <div className="w-full grid grid-cols-4 gap-4">
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
          ) : data?.length === 0 ? (
            <div>No posts</div>
          ) : (
            data?.map((post) => {
              return (
                <Post
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  liked={isDesignLiked(post._id)}
                />
              );
            })
            // Array(100)
            //   .fill(null)
            //   .map(() =>
            //     testData.map((post) => {
            //       return (
            //         <Post
            //           key={post._id}
            //           post={post}
            //           handleLike={handleLike}
            //           liked={isDesignLiked(post._id)}
            //         />
            //       );
            //     })
            //   )
          )}
        </div>
      </AnimatePresence> */}
    </div>
  );
};

export default Posts;
