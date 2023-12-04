const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    posts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
    },
    likedPosts: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
