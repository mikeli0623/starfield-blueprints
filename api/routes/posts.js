const express = require("express");
const router = express.Router();
const {
  deletePost,
  updatePost,
  likePost,
  getPost,
  getPosts,
  getMultiPosts,
  getFeatured,
  createPost,
} = require("../controllers/post");
const { verifyToken } = require("../utils/verifyToken");

router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.get("/find/:id", getPost);
router.get("/", getPosts);
router.patch("/like/:id", verifyToken, likePost);
router.get("/multi", getMultiPosts);
router.get("/featured", getFeatured);

module.exports = router;
