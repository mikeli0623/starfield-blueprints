import express from "express";
import {
  register,
  login,
  logout,
  checkLoggedIn,
  checkPassword,
} from "../controllers/auth.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/loggedIn", verifyToken, checkLoggedIn);
router.post("/checkPassword", verifyToken, checkPassword);

export default router;
