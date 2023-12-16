"use client";
import useRequest from "@/app/hooks/useRequest";
import { useAuth } from "@/app/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import {
  PostResponse,
  TagOptions,
  UserPopulateResponse,
} from "@/app/util/types";
import Button from "@/app/components/Button";
import Post from "@/app/components/Post";
import Collapse from "@/app/components/Collapse";
import UserPost from "@/app/components/UserPost";
import DeleteModal from "@/app/components/DeleteModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDesigns } from "@/app/context/DesignsContext";
import Link from "next/link";
import SearchGroup from "@/app/components/SearchGroup";
import Skeleton from "react-loading-skeleton";
import PostSkeleton from "@/app/components/skeletons/PostSkeleton";

export default function ViewUser({
  params,
}: {
  params: { userId: string; iv: string };
}) {
  const { state, dispatch } = useAuth();

  const isLogged = state.user?.loggedIn;
  const { userId, iv } = params;

  const toastRef = useRef<string>();

  useEffect(() => {
    sessionStorage.removeItem("previewPost");
  }, []);

  const {
    res: checkRes,
    loading: checkLoading,
    error: checkError,
    fetchData: checkSameUser,
  } = useRequest<boolean>("GET", `/users/check/${userId}/${iv}`);

  useEffect(() => {
    if (isLogged) checkSameUser();
  }, [isLogged, checkSameUser]);

  const [isSameUser, setIsSameUser] = useState<boolean>(false);

  useEffect(() => {
    if (checkRes && !checkError) setIsSameUser(checkRes.data);
  }, [checkRes, checkError]);

  const {
    res: userRes,
    loading: userLoading,
    error: userError,
    fetchData: fetchUser,
  } = useRequest<UserPopulateResponse>("GET", `/users/find/${userId}/${iv}`);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const {
    res: deletePostRes,
    loading: deletingPost,
    error: deletePostError,
    fetchData: deletePost,
  } = useRequest("DELETE");

  const {
    res: deleteUserRes,
    loading: deletingUser,
    error: deleteUserError,
    fetchData: deleteUser,
  } = useRequest("DELETE");

  const [postToDelete, setPostToDelete] = useState<{
    name: string;
    id: string;
  }>({ name: "", id: "" });

  const showDeletePostModal = (postId: string, postName: string) => {
    setPostToDelete({ name: postName, id: postId });
    (
      document.getElementById("delete-design-modal") as HTMLDialogElement
    ).showModal();
  };
  const handlePostDelete = (postId: string) => {
    removeUserDesign(postId);
    deletePost("", "/posts/" + postId);
    toastRef.current = toast.loading("Deleting design...");
  };

  useEffect(() => {
    if (!deletingPost && deletePostRes) {
      toast.success("Design deleted", {
        id: toastRef.current,
      });
      fetchUser();
    }
  }, [deletePostRes, deletingPost, fetchUser]);

  const router = useRouter();

  const handleUpdate = (postId: string) => {
    router.push(`/posts/edit/${postId}`);
  };

  const showDeleteUserModal = () => {
    (
      document.getElementById("delete-user-modal") as HTMLDialogElement
    ).showModal();
  };

  const handleUserDelete = (userId: string) => {
    dispatch({ type: "LOGOUT" });
    deleteUser("", "/users/" + userId);
    toastRef.current = toast.loading("Deleting account...");
  };

  useEffect(() => {
    if (!deletingUser && deleteUserRes) {
      toast.success("Account deleted", {
        id: toastRef.current,
      });
      router.push("/");
    }
  }, [deleteUserRes, deletingUser, router]);

  const { isDesignLiked, addLikedDesign, removeLikedDesign, removeUserDesign } =
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

  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([]);
  const [addedPosts, setAddedPosts] = useState<PostResponse[]>([]);

  useEffect(() => {
    if (userRes && !userError) {
      setLikedPosts(userRes.data.likedPosts);
      setAddedPosts(userRes.data.posts);
    }
  }, [userError, userRes]);

  // const [likedSearch, setLikedSearch] = useState<string>("");

  // const handleLikedSearchChange = (value: string | number) => {
  //   setLikedSearch(String(value));
  // };

  // const [likedTagOptions, setLikedTagOptions] = useState<TagOptions>({
  //   unmodded: true,
  //   modded: true,
  //   glitched: true,
  // });

  // const [likedTime, setLikedTime] = useState<string>("allTime");
  // const [likedSort, setLikedSort] = useState<string>("likes");

  // const [addedSearch, setAddedSearch] = useState<string>("");

  // const handleAddedSearchChange = (value: string | number) => {
  //   setAddedSearch(String(value));
  // };

  // const [addedTagOptions, setAddedTagOptions] = useState<TagOptions>({
  //   unmodded: true,
  //   modded: true,
  //   glitched: true,
  // });

  // const [addedTime, setAddedTime] = useState<string>("allTime");
  // const [addedSort, setAddedSort] = useState<string>("likes");

  // const testTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // const [loading, setLoading] = useState<boolean>(true);

  // useEffect(() => {
  //   testTimeout.current = setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);
  // }, []);

  if (!userRes && userError) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        User does not exist
      </main>
    );
  }

  const data = userRes?.data;

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
      {isSameUser && (
        <DeleteModal
          type="design"
          item={postToDelete}
          handleDelete={handlePostDelete}
        >
          <p className="pt-4">Are you sure you want to delete your design?</p>
        </DeleteModal>
      )}
      {isSameUser && data && (
        <DeleteModal
          type="user"
          item={{ name: data.username, id: userId }}
          handleDelete={handleUserDelete}
        >
          <p className="pt-4">Are you sure you want to delete your account?</p>
          <p>All designs created by the account will still be available.</p>
        </DeleteModal>
      )}
      <h1 className="text-2xl font-bold">
        {!data ? (
          <Skeleton width={300} height={"24px"} />
        ) : isSameUser ? (
          "Your Profile"
        ) : (
          <span className="text-gray-600">Profile of {data.username}</span>
        )}
      </h1>
      <Collapse
        title={`Designs: ${addedPosts.length || 0}`}
        empty={data ? data.posts.length === 0 : false}
      >
        <div className="p-4">
          {/* <SearchGroup
            searchValue={likedSearch}
            handleSearchChange={handleLikedSearchChange}
            time={likedTime}
            setTime={setLikedTime}
            sort={likedSort}
            setSort={setLikedSort}
            tagOptions={likedTagOptions}
            setTagOptions={setLikedTagOptions}
          /> */}
          {addedPosts.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 w-full">
              {addedPosts.map((post) =>
                isSameUser ? (
                  <UserPost
                    key={post._id}
                    post={post}
                    handleDelete={showDeletePostModal}
                    handleUpdate={handleUpdate}
                    handleLike={handleLike}
                    liked={isDesignLiked(post._id)}
                  />
                ) : (
                  <Post
                    key={post._id}
                    post={post}
                    handleLike={handleLike}
                    liked={isDesignLiked(post._id)}
                  />
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 w-full">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
            </div>
          )}
        </div>
      </Collapse>
      <Collapse
        title={`Liked Designs: ${likedPosts.length || 0}`}
        empty={data ? data.likedPosts.length === 0 : false}
      >
        <div className="p-4">
          {/* <SearchGroup
            searchValue={addedSearch}
            handleSearchChange={handleAddedSearchChange}
            time={addedTime}
            setTime={setAddedTime}
            sort={addedSort}
            setSort={setAddedSort}
            tagOptions={addedTagOptions}
            setTagOptions={setAddedTagOptions}
          /> */}
          {likedPosts.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 w-full">
              {likedPosts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  liked={isDesignLiked(post._id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 w-full">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
            </div>
          )}
        </div>
      </Collapse>
      {isSameUser && (
        <Link href={`/users/edit`}>
          <div className="join">
            <Button className="join-item btn-secondary">
              Change Login Info
            </Button>
            <Button
              className="join-item btn-primary"
              handleClick={showDeleteUserModal}
            >
              Delete Account
            </Button>
          </div>
        </Link>
      )}
    </main>
  );
}
