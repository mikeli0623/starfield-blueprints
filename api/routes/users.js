const express = require("express");
const router = express.Router();
const {
  deleteUser,
  updateUser,
  getUser,
  getMe,
  checkIsUser,
  updatePassword,
} = require("../controllers/user");
const { verifyToken } = require("../utils/verifyToken");

router.put("/:id/:iv", verifyToken, updateUser);
router.patch("/updatePassword", verifyToken, updatePassword);
router.delete("/:id", verifyToken, deleteUser);
router.get("/find/:id/:iv", getUser);
router.get("/check/:id/:iv", verifyToken, checkIsUser);
router.get("/me", verifyToken, getMe);

module.exports = router;
