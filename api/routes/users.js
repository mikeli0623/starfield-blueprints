import express from "express";
import {
  deleteUser,
  updateUser,
  getUser,
  getMe,
  checkIsUser,
  updatePassword,
} from "../controllers/user.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.put("/:id/:iv", verifyToken, updateUser);
router.patch("/updatePassword", verifyToken, updatePassword);
router.delete("/:id", verifyToken, deleteUser);
router.get("/find/:id/:iv", getUser);
router.get("/check/:id/:iv", verifyToken, checkIsUser);
router.get("/me", verifyToken, getMe);

export default router;
