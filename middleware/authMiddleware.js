const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const getToken = (req) => req.cookies.token;

const attachUser = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.teamPanelUsers = [];

  try {
    const token = getToken(req);
    if (!token || !process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    }
  } catch (error) {
    res.clearCookie("token");
  }

  if (req.user) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const visibleProjects =
      req.user.role === "admin"
        ? await Project.find({ createdBy: req.user._id }).select("members")
        : await Project.find({ members: req.user._id }).select("members");
    const visibleUserIds = [
      req.user._id.toString(),
      ...visibleProjects
        .flatMap((project) => project.members)
        .map((memberId) => memberId.toString())
    ];
    const uniqueVisibleUserIds = [...new Set(visibleUserIds)];

    const users = await User.find({ _id: { $in: uniqueVisibleUserIds } })
      .select("name email role workStatus todayWorkSummary currentTask lastSeenAt")
      .populate("currentTask", "title status dueDate project")
      .sort({ workStatus: 1, name: 1 });

    res.locals.teamPanelUsers = await Promise.all(
      users.map(async (user) => {
        const [activeTasks, doneToday] = await Promise.all([
          Task.countDocuments({
            assignedTo: user._id,
            status: { $ne: "Done" }
          }),
          Task.countDocuments({
            assignedTo: user._id,
            status: "Done",
            updatedAt: { $gte: startOfDay }
          })
        ]);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          workStatus: user.workStatus,
          todayWorkSummary: user.todayWorkSummary,
          currentTask: user.currentTask,
          lastSeenAt: user.lastSeenAt,
          activeTasks,
          doneToday
        };
      })
    );
  }

  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  if (req.user.role !== "admin") {
    return res.status(403).render("error", {
      title: "Forbidden",
      message: "Only admins can access this page."
    });
  }

  next();
};

module.exports = {
  attachUser,
  requireAuth,
  requireAdmin
};
