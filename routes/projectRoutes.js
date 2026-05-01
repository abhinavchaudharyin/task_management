const express = require("express");
const projectController = require("../controllers/projectController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, projectController.index);
router.post("/", requireAdmin, projectController.create);
router.get("/:id", requireAuth, projectController.show);
router.post("/:id/members", requireAdmin, projectController.addMember);

module.exports = router;
