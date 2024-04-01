import User from "../models/User.js";
import { createError } from "../utils/error.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import bcrypt from "bcrypt";

export const deleteUser = async (req, res) => {
  try {
    const userId = decrypt(req.params.id, req.user.iv);

    if (!(req.user.id === userId || req.user.isAdmin))
      next(createError(403, "You are not authorized!"));

    await User.findByIdAndDelete(userId);
    if (!req.user.isAdmin) res.clearCookie("access_token");
    res.status(200).json("Account has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateUserLikes = async (userId, postId) => {
  try {
    const user = await User.findById(userId);

    const isLiked = user.likedPosts.includes(postId);

    if (isLiked) {
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } });
    } else {
      await User.findByIdAndUpdate(userId, { $push: { likedPosts: postId } });
    }
  } catch (err) {
    throw err;
  }
};

export const addUserPosts = async (userId, postId) => {
  try {
    await User.findByIdAndUpdate(userId, { $push: { posts: postId } });
  } catch (err) {
    throw err;
  }
};

export const removePostFromUser = async (userId, postId) => {
  try {
    // pull from post user's posts
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId },
    });

    await User.updateMany(
      { likedPosts: postId },
      { $pull: { likedPosts: postId } }
    );
  } catch (err) {
    throw err;
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.user;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hash,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id, iv } = req.params;
    const userId = decrypt(id, iv);

    if (!(req.user.id === userId || req.user.isAdmin))
      next(createError(403, "You are not authorized!"));

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hash,
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id: userId, iv } = req.params;

    const realId = decrypt(userId, iv);
    const user = await User.findById(realId).populate("posts likedPosts");
    if (!user) next(createError(404, "User not found"));

    user.posts.forEach((post) => {
      post.userId.id = encrypt(post.userId.id.toString(), post.userId.iv);
    });

    user.likedPosts.forEach((post) => {
      post.userId.id = encrypt(post.userId.id.toString(), post.userId.iv);
    });

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const { _id, iv, ...other } = user.toObject();

    const encryptedId = encrypt(_id, iv);

    const encryptedUser = {
      ...other,
      id: encryptedId,
      iv,
    };
    res.status(200).json(encryptedUser);
  } catch (error) {
    next(error);
  }
};

export const checkIsUser = async (req, res, next) => {
  try {
    const { id: userId, iv } = req.params;

    const realId = decrypt(userId, iv);

    let isUser = realId === req.user.id;
    res.status(200).json(isUser);
  } catch (error) {
    next(error);
  }
};
