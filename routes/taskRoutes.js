const express = require("express");
const taskController = require("../controllers/taskController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, taskController.index);
router.post("/", requireAdmin, taskController.create);
router.post("/:id", requireAdmin, taskController.update);
router.post("/:id/start", requireAuth, taskController.startWork);
router.post("/work/stop", requireAuth, taskController.stopWork);
router.post("/:id/status", requireAuth, taskController.updateStatus);
router.post("/:id/delete", requireAdmin, taskController.destroy);

module.exports = router;
