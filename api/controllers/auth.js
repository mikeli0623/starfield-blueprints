const User = require("../models/User");
const bcrypt = require("bcrypt");
const createError = require("../utils/error");
const jwt = require("jsonwebtoken");
require("dotenv/config");
const crypto = require("crypto");
const { encrypt, decrypt } = require("../utils/encryption");

module.exports = {
  register: async (req, res, next) => {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);

      const iv = crypto.randomBytes(16).toString("hex");

      const newUser = new User({
        username: req.body.username,
        password: hash,
        iv,
      });
      const newUserInfo = await newUser.save();

      const { username, _id, isAdmin } = newUserInfo._doc;

      const encryptedId = encrypt(_id, iv);

      const token = jwt.sign(
        { id: _id, username, isAdmin, iv },
        process.env.JWT
      );

      res
        .cookie("access_token", token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        })
        .status(201)
        .send({ username, isAdmin, id: encryptedId, iv });
    } catch (err) {
      if (err.code === 11000) next(createError(500, "Username already taken."));
      else next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) return next(createError(404, "Wrong password or username!"));

      const { username, password, _id, isAdmin, iv, posts, likedPosts } =
        user._doc;

      const encryptedId = encrypt(_id, iv);

      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        password
      );
      if (!isPasswordCorrect)
        return next(createError(400, "Wrong password or username!"));

      const token = jwt.sign(
        { id: _id, username: username, isAdmin: isAdmin, iv },
        process.env.JWT
      );

      // 2 weeks in ms
      const expiryTime = req.body.remember
        ? 24 * 60 * 60 * 1000 * 7 * 2
        : undefined;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
          maxAge: expiryTime,
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ username, isAdmin, id: encryptedId, iv, posts, likedPosts });
    } catch (err) {
      next(err);
    }
  },
  logout: (req, res) => {
    res.clearCookie("access_token");
    res.status(200).json("User has been logged out.");
  },
  checkLoggedIn: (req, res) => {
    res.status(200).json("User is logged in.");
  },
  checkPassword: async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.user.username });

      const { password } = user._doc;

      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        password
      );

      if (!isPasswordCorrect)
        return next(createError(400, "Password does not match"));

      res.status(200).json("Password is correct");
    } catch (err) {
      next(err);
    }
  },
};
