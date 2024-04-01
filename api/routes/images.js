import express from "express";
import {
  uploadImages,
  deleteImages,
  getImages,
  uploadTempImages,
  getTempImages,
  deleteTempImages,
} from "../controllers/image.js";
import { verifyToken } from "../utils/verifyToken.js";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  if (
    ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(new Error("Image must be in PNG, JPG, or WEBP format."), false);
  }
};

const memStorage = multer.memoryStorage();
const memUpload = multer({
  storage: memStorage,
  fileFilter,
});

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const id = req.params.id;
    const dest = path.join(__dirname, "..", "api", "uploads", id);

    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) {
        return cb(err, null);
      }
      cb(null, dest);
    });
  },
  filename: function (req, file, cb) {
    const [fileName, ext] = file.originalname.split(".");
    cb(null, `${fileName}.${ext}`);
  },
});

const diskUpload = multer({ storage: diskStorage, fileFilter });

router.get("/:id", getImages);
router.post("/", verifyToken, memUpload.any("images"), uploadImages);
router.post(
  "/temp/:id",
  verifyToken,
  diskUpload.any("images"),
  uploadTempImages
);
router.get("/temp/:id", verifyToken, getTempImages);
router.delete("/temp/:id", verifyToken, deleteTempImages);
router.delete("/:keys", verifyToken, deleteImages);

export default router;
