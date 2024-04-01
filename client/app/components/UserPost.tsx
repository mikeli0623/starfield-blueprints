import React from "react";
import { PostResponse } from "../util/types";
import Image from "next/image";
import PostCard from "./PostCard";
import Button from "./Button";
import editIcon from "../../public/edit.svg";
import deleteIcon from "../../public/delete.svg";

interface UserPostProps {
  post: PostResponse;
  handleDelete: (postId: string, postName: string) => void;
  handleUpdate: (postId: string) => void;
  handleLike: ((postId: string) => void) | null;
  liked: boolean;
}

const UserPost = ({
  post,
  handleDelete,
  handleUpdate,
  handleLike,
  liked,
}: UserPostProps) => {
  return (
    <div className="flex flex-col justify-between bg-slate-300 rounded-b-2xl shadow-xl">
      <PostCard post={post} minimal liked={liked} handleLike={handleLike} />
      <div className="flex p-4 items-center justify-evenly bg-slate-300 rounded-b-2xl grow">
        <Button
          className="btn-circle"
          handleClick={() => handleUpdate(post._id)}
        >
          <Image src={editIcon} alt="edit" width={35} height={35} />
        </Button>
        <Button
          className="btn-circle btn-primary"
          handleClick={() => handleDelete(post._id, post.title)}
        >
          <Image src={deleteIcon} alt="delete" width={35} height={35} />
        </Button>
      </div>
    </div>
  );
};

export default UserPost;
