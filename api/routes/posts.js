import express from "express";
import {
  deletePost,
  updatePost,
  likePost,
  getPost,
  getPosts,
  getMultiPosts,
  getFeatured,
  createPost,
  checkUser,
} from "../controllers/post.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.get("/find/:id", getPost);
router.get("/", getPosts);
router.patch("/like/:id", verifyToken, likePost);
router.get("/multi", getMultiPosts);
router.get("/featured", getFeatured);
router.get("/checkUser/:id", verifyToken, checkUser);

export default router;
