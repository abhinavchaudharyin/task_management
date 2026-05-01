const AdminRequest = require("../models/AdminRequest");
const Task = require("../models/Task");

exports.index = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { createdBy: req.user._id }
        : { assignedTo: req.user._id };

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      pendingAdminRequests,
      myAdminRequest
    ] =
      await Promise.all([
        Task.countDocuments(filter),
        Task.countDocuments({ ...filter, status: "Todo" }),
        Task.countDocuments({ ...filter, status: "In Progress" }),
        Task.countDocuments({ ...filter, status: "Done" }),
        Task.countDocuments({
          ...filter,
          dueDate: { $lt: new Date() },
          status: { $ne: "Done" }
        }),
        req.user.role === "admin"
          ? AdminRequest.find({ status: "pending" })
              .populate("user", "name email createdAt")
              .sort({ createdAt: 1 })
          : [],
        AdminRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 })
      ]);

    res.render("dashboard", {
      title: "Dashboard",
      pendingAdminRequests,
      myAdminRequest,
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      }
    });
  } catch (error) {
    next(error);
  }
};
