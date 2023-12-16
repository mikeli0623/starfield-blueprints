const createError = require("../utils/error");
const { uploadToS3, getPresignedUrls, deleteFromS3 } = require("../utils/s3");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");

const convertToWebp = async (file) => {
  try {
    const webpBuffer = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();
    file.buffer = webpBuffer;
    file.mimetype = "image/webp";
  } catch (error) {
    throw error;
  }
};

const getImageURLsById = async (id) => {
  const uploadsFolder = path.join(__dirname, "..", "api", "uploads", id); // Adjust the path based on your structure

  try {
    const files = fs.readdirSync(uploadsFolder);
    const imageUrls = files.map((file) => {
      return `/uploads/${id}/${file}`; // Adjust the URL path based on your route setup
    });

    return imageUrls;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadImages: async (req, res, next) => {
    const { files } = req;
    const postId = req.body.id;

    if (!files.length) next(createError(400, "No file(s) to upload"));

    try {
      // convert images to webp
      const convertPromise = [];
      files.forEach((file) => {
        if (file.mimetype !== "image/webp")
          convertPromise.push(convertToWebp(file));
      });

      await Promise.all(convertPromise);

      const { keys, error } = await uploadToS3({ files, postId });
      if (error) next(createError(500, error.message));
      res.status(201).json({ keys });
    } catch (err) {
      next(err);
    }
  },
  deleteImages: async (req, res, next) => {
    const keys = req.params.keys.split(",");
    try {
      const { result, error } = await deleteFromS3(keys);
      if (error) next(createError(500, error.message));
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
  getImages: async (req, res, next) => {
    const postId = req.params.id;
    try {
      const { presignedUrls, error } = await getPresignedUrls(postId);
      if (error) next(createError(400, error.message));
      res.status(200).json(presignedUrls);
    } catch (err) {
      next(err);
    }
  },
  uploadTempImages: (req, res) => {
    const { id } = req.params;

    // cleans up image after min minutes, if not already cleaned up
    const min = 15;
    schedule.scheduleJob(id, new Date(Date.now() + min * 60 * 1000), () => {
      const dir = path.join(__dirname, "..", "api", "uploads", id);
      try {
        fs.rmSync(dir, { recursive: true });
      } catch (err) {
        console.log(err);
      }
    });

    res.status(200).send("Images uploaded");
  },
  getTempImages: async (req, res, next) => {
    try {
      const id = req.params.id;
      const imageUrls = await getImageURLsById(id);
      res.status(200).json(imageUrls);
    } catch (error) {
      next(error);
    }
  },
  deleteTempImages: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dir = path.join(__dirname, "..", "api", "uploads", id);
      fs.rmSync(dir, { recursive: true });
      const deleteTempImagesJob = schedule.scheduledJobs[id];
      deleteTempImagesJob.cancel();
      res.status(200).json("Images deleted");
    } catch (error) {
      next(error);
    }
  },
};
