import Post from "../models/Post.js";
import { createError } from "../utils/error.js";
import {
  updateUserLikes,
  addUserPosts,
  removePostFromUser,
} from "../controllers/user.js";
import { encrypt } from "../utils/encryption.js";
import { deleteFromS3 } from "../utils/s3.js";
import { getPlaceholder } from "../controllers/image.js";

const createPost = async (req, res, next) => {
  const { username, id: userId, iv } = req.user;
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    videos: req.body.videos,
    username: username,
    shipParts: req.body.shipParts,
    about: req.body.about,
    userId: {
      id: userId,
      iv: iv,
    },
    tags: req.body.tags,
  });

  try {
    const savedPost = await post.save();
    const postId = savedPost._id;
    await addUserPosts(userId, postId, next);
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  const { isAdmin, id: userId } = req.user;
  const postId = req.params.id;

  try {
    const post = await Post.findOne({ _id: postId });

    if (!(post.userId.id === userId || isAdmin))
      next(createError(403, "You are not authorized!"));

    if (!post) next(createError(404, "Post not found"));

    await await Post.findByIdAndDelete(req.params.id);
    await deleteFromS3(post.imageKeys);
    await removePostFromUser(userId, postId);
    res.status(200).json("Post has been deleted");
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  const postId = req.params.id;
  const { id: userId, iv } = req.user;
  const isAdmin = req.user.isAdmin;
  const { imageKeys } = req.body;

  if (isAdmin) {
    try {
      const placeholderSVG = await getPlaceholder(imageKeys[0]);
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $set: {
            ...req.body,
            placeholderSVG: JSON.stringify(placeholderSVG),
          },
        },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    try {
      const placeholderSVG = await getPlaceholder(imageKeys[0]);
      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: postId,
          "userId.id": userId,
          "userId.iv": iv,
        },
        {
          $set: { ...req.body, placeholderSVG: JSON.stringify(placeholderSVG) },
        },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } catch (err) {
      next(err);
    }
  }
};

const likePost = async (req, res, next) => {
  const postId = req.params.id;
  const liked = req.body.liked;
  try {
    const updatedPost = await Post.findOne({ _id: postId });

    if (liked) await updatedPost.incrementLikes();
    else await updatedPost.decrementLikes();

    await updateUserLikes(req.user.id, postId, next);

    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) next(createError(404, "Post does not exist"));
    const encryptedUserId = encrypt(post.userId.id.toString(), post.userId.iv);
    post.userId = { id: encryptedUserId, iv: post.userId.iv };
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};
const getMultiPosts = async (req, res, next) => {
  try {
    const postIds = req.query.ids ? req.query.ids.split(",") : [];

    const posts = await Post.find({
      _id: { $in: postIds },
    }).sort({ likes: -1 });

    if (!posts) next(createError(404, "Posts do not exist"));

    if (posts.length === 0) return res.status(200).json(posts);

    posts.forEach((post) => {
      post.userId.id = encrypt(post.userId.id.toString(), post.userId.iv);
    });

    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  const { title, sort, excludedTags: tags, time, page, pageSize } = req.query;
  const currentTime = new Date();
  const startDate = new Date(currentTime);

  switch (time) {
    case "pastDay":
      startDate.setDate(currentTime.getDate() - 1);
      break;
    case "pastWeek":
      startDate.setDate(currentTime.getDate() - 7);
      break;
    case "pastMonth":
      startDate.setMonth(currentTime.getMonth() - 1);
      break;
    case "pastYear":
      startDate.setFullYear(currentTime.getFullYear() - 1);
      break;
    case "allTime":
      startDate.setFullYear(currentTime.getFullYear() - 999);
      break;
  }

  let tagsQuery;
  if (tags) tagsQuery = tags.split(",");

  try {
    let posts;
    if (title) {
      if (sort === "likes")
        posts = await Post.fuzzySearch(title, {
          tags: { $nin: tagsQuery },
          createdAt: { $gte: startDate },
        })
          .sort({ likes: -1 })
          .skip((page - 1) * pageSize)
          .limit(Number(pageSize));
      else if (sort === "createdAt")
        posts = await Post.fuzzySearch(title, {
          tags: { $nin: tagsQuery },
          createdAt: { $gte: startDate },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(Number(pageSize));
    } else {
      // title query is empty or less than 3
      if (sort === "likes")
        posts = await Post.find({
          tags: { $nin: tagsQuery },
          createdAt: { $gte: startDate },
        })
          .sort({ likes: -1 })
          .skip((page - 1) * pageSize)
          .limit(Number(pageSize));
      else if (sort === "createdAt")
        posts = await Post.find({
          tags: { $nin: tagsQuery },
          createdAt: { $gte: startDate },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(Number(pageSize));
    }

    posts.forEach((post) => {
      post.userId.id = encrypt(post.userId.id.toString(), post.userId.iv);
    });

    const pagePost = posts.map((post) => ({
      ...post.toObject(),
      page: Number(page),
    }));

    res.status(200).json(pagePost);
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    // const timeRange = new Date();
    // 7 for week
    // timeRange.setDate(timeRange.getDate() - 99);
    const featuredPosts = await Post.find({
      likes: { $gte: 2 },
      // createdAt: { $gte: timeRange },
    })
      .sort({ likes: -1 })
      .limit(5);

    featuredPosts.forEach((post) => {
      post.userId.id = encrypt(post.userId.id.toString(), post.userId.iv);
    });

    res.status(200).json(featuredPosts);
  } catch (err) {
    next(err);
  }
};

const checkUser = async (req, res, next) => {
  try {
    const { user } = req;
    const post = await Post.findById(req.params.id);
    if (!post) next(createError(404, "Post does not exist"));
    res.status(200).json(user.id === post.userId.id);
  } catch (err) {
    next(err);
  }
};

export {
  createPost,
  deletePost,
  updatePost,
  likePost,
  getPost,
  getMultiPosts,
  getPosts,
  getFeatured,
  checkUser,
};
