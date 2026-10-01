const express = require("express");
const { getShops, getShopDetails, searchLocations } = require("../controllers/shopController");

const router = express.Router();

// Public routes for shop discovery
router.get("/locations/search", searchLocations); // Put this before /shops/:id if it was /shops/search, but here it's fine.
router.get("/shops", getShops);
router.get("/shops/:id", getShopDetails);

module.exports = router;
