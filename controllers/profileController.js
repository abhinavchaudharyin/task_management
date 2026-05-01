const User = require("../models/User");

exports.updateStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ["online", "working", "leave", "offline"];
    const workStatus = allowedStatuses.includes(req.body.workStatus)
      ? req.body.workStatus
      : "online";

    const update = {
      workStatus,
      todayWorkSummary: req.body.todayWorkSummary || "No update yet",
      lastSeenAt: new Date()
    };

    if (workStatus !== "working") {
      update.$unset = { currentTask: "" };
    }

    await User.findByIdAndUpdate(req.user._id, update);

    res.redirect(req.get("Referrer") || "/dashboard");
  } catch (error) {
    next(error);
  }
};
