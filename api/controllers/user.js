const User = require("../models/User");
const createError = require("../utils/error");
const { encrypt, decrypt } = require("../utils/encryption");
const bcrypt = require("bcrypt");

module.exports = {
  deleteUser: async (req, res) => {
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
  },
  updateUserLikes: async (userId, postId) => {
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
  },
  addUserPosts: async (userId, postId) => {
    try {
      await User.findByIdAndUpdate(userId, { $push: { posts: postId } });
    } catch (err) {
      throw err;
    }
  },
  removePostFromUser: async (userId, postId) => {
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
  },
  updatePassword: async (req, res, next) => {
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
  },
  updateUser: async (req, res, next) => {
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
  },
  getUser: async (req, res, next) => {
    try {
      const { id: userId, iv } = req.params;

      const realId = decrypt(userId, iv);
      const user = await User.findById(realId).populate("posts likedPosts");
      if (!user) next(createError(404, "User not found"));
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },
  getMe: async (req, res, next) => {
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
  },
  checkIsUser: async (req, res, next) => {
    try {
      const { id: userId, iv } = req.params;

      const realId = decrypt(userId, iv);

      let isUser = realId === req.user.id;
      res.status(200).json(isUser);
    } catch (error) {
      next(error);
    }
  },
};