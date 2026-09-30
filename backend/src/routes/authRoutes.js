const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Public routes (no token needed)
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// Protected route (token required)
router.get("/auth/me", verifyToken, getMe);

module.exports = router;
