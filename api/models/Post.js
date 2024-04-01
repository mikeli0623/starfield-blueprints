import mongoose from "mongoose";
import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";

const Schema = mongoose.Schema;

const PostSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  about: {
    type: String,
  },
  videos: {
    type: [String],
    default: [],
  },
  imageKeys: {
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  placeholderSVG: {
    type: String,
  },
  userId: {
    type: {
      id: String,
      iv: String,
    },
    required: true,
  },
  shipParts: {
    type: [
      {
        partName: String,
        amount: Number,
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.plugin(mongoose_fuzzy_searching, { fields: ["title", "username"] });

PostSchema.methods.incrementLikes = function () {
  this.likes += 1;
  return this.save();
};

PostSchema.methods.decrementLikes = function () {
  this.likes -= 1;
  return this.save();
};

export default mongoose.model("Post", PostSchema);
