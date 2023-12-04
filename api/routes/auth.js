const express = require("express");
const {
  register,
  login,
  logout,
  checkLoggedIn,
  checkPassword,
} = require("../controllers/auth");
const router = express.Router();
const { verifyToken } = require("../utils/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/loggedIn", verifyToken, checkLoggedIn);
router.post("/checkPassword", verifyToken, checkPassword);

module.exports = router;
