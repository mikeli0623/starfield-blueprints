import { createError } from "../utils/error.js";
import { uploadToS3, getPresignedUrls, deleteFromS3 } from "../utils/s3.js";
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import schedule from "node-schedule";
import { getPlaiceholder } from "plaiceholder";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const uploadImages = async (req, res, next) => {
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
};

const deleteImages = async (req, res, next) => {
  const keys = req.params.keys.split(",");
  try {
    const { result, error } = await deleteFromS3(keys);
    if (error) next(createError(500, error.message));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getImages = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const { presignedUrls, error } = await getPresignedUrls(postId);
    if (error) next(createError(400, error.message));
    res.status(200).json(presignedUrls);
  } catch (err) {
    next(err);
  }
};

const uploadTempImages = (req, res) => {
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
};

const getTempImages = async (req, res, next) => {
  try {
    const id = req.params.id;
    const imageUrls = await getImageURLsById(id);
    res.status(200).json(imageUrls);
  } catch (error) {
    next(error);
  }
};

const deleteTempImages = async (req, res, next) => {
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
};

const getPlaceholder = async (key) => {
  const IMG_URL = "https://starfield-blueprints.s3.amazonaws.com/";
  const src = IMG_URL + key;
  const buffer = await fetch(src).then(async (res) =>
    Buffer.from(await res.arrayBuffer())
  );
  const { svg } = await getPlaiceholder(buffer, {
    size: 10,
  });
  return svg[2];
};

export {
  uploadImages,
  deleteImages,
  getImages,
  uploadTempImages,
  getTempImages,
  deleteTempImages,
  getPlaceholder,
};
