const express = require("express");
const adminRequestController = require("../controllers/adminRequestController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id/approve", requireAdmin, adminRequestController.approve);
router.post("/:id/reject", requireAdmin, adminRequestController.reject);

module.exports = router;
