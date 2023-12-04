"use client";
import useRequest from "@/app/hooks/useRequest";
import { useAuth } from "@/app/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import { PostResponse, UserPopulateResponse } from "@/app/util/types";
import Button from "@/app/components/Button";
import Post from "@/app/components/Post";
import Collapse from "@/app/components/Collapse";
import UserPost from "@/app/components/UserPost";
import DeleteModal from "@/app/components/DeleteModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDesigns } from "@/app/context/DesignsContext";
import PasswordChecklist from "react-password-checklist";
import Link from "next/link";

export default function Page({
  params,
}: {
  params: { userId: string; iv: string };
}) {
  const { state, dispatch } = useAuth();

  const isLogged = state.user?.loggedIn;
  const { userId, iv } = params;

  const toastRef = useRef<string>();

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
  const handleUpdate = (post: PostResponse) => {
    sessionStorage.setItem("editPost", JSON.stringify(post));
    router.push(`/posts/edit/${post._id}`);
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

  if (!userRes && userError) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        User does not exist
      </main>
    );
  }

  if (userRes) {
    const data = userRes.data;
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        {isSameUser && (
          <DeleteModal
            type="design"
            item={postToDelete}
            handleDelete={handlePostDelete}
          >
            <p className="pt-4">Are you sure you want to delete your design?</p>
          </DeleteModal>
        )}
        {isSameUser && (
          <DeleteModal
            type="user"
            item={{ name: data.username, id: userId }}
            handleDelete={handleUserDelete}
          >
            <p className="pt-4">
              Are you sure you want to delete your account?
            </p>
            <p>All designs created by the account will still be available.</p>
          </DeleteModal>
        )}
        <h1 className="text-2xl font-bold mb-4">
          {isSameUser ? (
            "Your Profile"
          ) : (
            <>
              <span className="text-gray-600">Profile of</span> {data.username}
            </>
          )}
        </h1>
        <Collapse
          title={`Designs: ${data.posts.length || 0}`}
          empty={data.posts.length === 0}
          defaultOpen={data.posts.length !== 0}
        >
          {data.posts.length > 0 ? (
            data.posts.map((post) =>
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
            )
          ) : (
            <span className="loading loading-ring loading-md" />
          )}
        </Collapse>
        <Collapse
          title={`Liked Designs: ${data.likedPosts.length || 0}`}
          empty={userRes.data.likedPosts.length === 0}
          defaultOpen={userRes.data.likedPosts.length !== 0}
        >
          {data.likedPosts.length > 0 ? (
            data.likedPosts.map((post) => (
              <Post
                key={post._id}
                post={post}
                handleLike={handleLike}
                liked={isDesignLiked(post._id)}
              />
            ))
          ) : (
            <span className="loading loading-ring loading-md" />
          )}
        </Collapse>
        {isSameUser && (
          <Link href={`/users/edit`}>
            <div className="join mt-4">
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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <span className="loading loading-ring loading-md" />
    </main>
  );
}
