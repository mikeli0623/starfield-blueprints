import { PostResponse } from "../util/types";
import PostCard from "./PostCard";
import { motion } from "framer-motion";

interface PostProps {
  post: PostResponse;
  handleLike: ((postId: string) => void) | null;
  liked: boolean;
}

const Post = ({ post, handleLike = null, liked = false }: PostProps) => {
  return (
    <motion.div
      className="m-4 shadow-xl rounded-b-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PostCard post={post} handleLike={handleLike} liked={liked} />
    </motion.div>
  );
};

export default Post;
