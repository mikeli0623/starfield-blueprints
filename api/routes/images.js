const express = require("express");
const router = express.Router();
const {
  uploadImages,
  deleteImages,
  getImages,
  uploadTempImages,
  getTempImages,
  deleteTempImages,
} = require("../controllers/image");
const { verifyToken } = require("../utils/verifyToken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

module.exports = router;
