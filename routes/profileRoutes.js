const express = require("express");
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/status", requireAuth, profileController.updateStatus);

module.exports = router;
