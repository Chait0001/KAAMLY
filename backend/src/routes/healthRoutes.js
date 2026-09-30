const express = require("express");
const { getHealth } = require("../controllers/healthController");

// Each feature will get its own router file (authRoutes.js, shopRoutes.js, …).
// We keep routes thin — just map URL → controller function.
const router = express.Router();

router.get("/health", getHealth);

module.exports = router;
