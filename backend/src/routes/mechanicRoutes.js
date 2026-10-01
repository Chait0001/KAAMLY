const express = require("express");
const { getMechanicDetails } = require("../controllers/mechanicController");

const router = express.Router();

// Public routes for mechanic discovery
router.get("/mechanics/:id", getMechanicDetails);

module.exports = router;
