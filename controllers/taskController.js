const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

exports.index = async (req, res, next) => {
  try {
    const { status, project, assignee, q } = req.query;
    const ownedProjects =
      req.user.role === "admin"
        ? await Project.find({ createdBy: req.user._id }).select("_id members")
        : await Project.find({ members: req.user._id }).select("_id members");
    const ownedProjectIds = ownedProjects.map((ownedProject) => ownedProject._id);
    const memberIds = [
      ...new Set(
        ownedProjects
          .flatMap((ownedProject) => ownedProject.members)
          .map((memberId) => memberId.toString())
      )
    ];

    const filter =
      req.user.role === "admin"
        ? { project: { $in: ownedProjectIds } }
        : { assignedTo: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (project) {
      filter.project = project;
    }

    if (assignee && req.user.role === "admin") {
      filter.assignedTo = assignee;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    const [tasks, projects, users] = await Promise.all([
      Task.find(filter)
        .populate("project", "name members")
        .populate("assignedTo", "name email")
        .populate("createdBy", "name")
        .sort({ dueDate: 1 }),
      Project.find(
        req.user.role === "admin"
          ? { createdBy: req.user._id }
          : { members: req.user._id }
      )
        .populate("members", "name email")
        .sort({ name: 1 }),
      User.find({
        _id: {
          $in:
            req.user.role === "admin"
              ? memberIds.map((memberId) => new mongoose.Types.ObjectId(memberId))
              : [req.user._id]
        }
      })
        .select("name email role workStatus currentTask")
        .sort({ name: 1 })
    ]);

    res.render("tasks/index", {
      title: "Tasks",
      tasks,
      projects,
      users,
      statuses: ["Todo", "In Progress", "Done"],
      filters: {
        status: status || "",
        project: project || "",
        assignee: assignee || "",
        q: q || ""
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } =
      req.body;
    const assignedUsers = Array.isArray(assignedTo)
      ? assignedTo.filter(Boolean)
      : [assignedTo].filter(Boolean);

    if (!title || !projectId || assignedUsers.length === 0 || !dueDate) {
      return res.redirect("/tasks");
    }

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.redirect("/tasks");
    }

    await Task.findByIdAndUpdate(req.params.id, {
      title,
      description,
      project: projectId,
      assignedTo: assignedUsers,
      status,
      dueDate
    });

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { members: { $each: assignedUsers } }
    });

    res.redirect("/tasks");
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } =
      req.body;
    const assignedUsers = Array.isArray(assignedTo)
      ? assignedTo.filter(Boolean)
      : [assignedTo].filter(Boolean);

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user._id
    });
    if (!project || assignedUsers.length === 0) {
      return res.redirect("/tasks");
    }

    await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedUsers,
      status: status || "Todo",
      dueDate,
      createdBy: req.user._id
    });

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { members: { $each: assignedUsers } }
    });

    res.redirect("/tasks");
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.redirect("/tasks");
  } catch (error) {
    next(error);
  }
};

exports.startWork = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect("/tasks");
    }

    const assignedUserIds = task.assignedTo.map((userId) => userId.toString());
    const canStart =
      req.user.role === "admin" ||
      assignedUserIds.includes(req.user._id.toString());

    if (!canStart) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You can only start work on tasks assigned to you."
      });
    }

    task.status = "In Progress";
    await task.save();

    await User.findByIdAndUpdate(req.user._id, {
      workStatus: "working",
      currentTask: task._id,
      todayWorkSummary: `Working on: ${task.title}`,
      lastSeenAt: new Date()
    });

    res.redirect(req.get("Referrer") || "/tasks");
  } catch (error) {
    next(error);
  }
};

exports.stopWork = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      workStatus: "online",
      $unset: { currentTask: "" },
      lastSeenAt: new Date()
    });

    res.redirect(req.get("Referrer") || "/tasks");
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect("/tasks");
    }

    const assignedUserIds = Array.isArray(task.assignedTo)
      ? task.assignedTo.map((userId) => userId.toString())
      : [task.assignedTo.toString()];
    const canUpdate =
      req.user.role === "admin" ||
      assignedUserIds.includes(req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message: "You can only update tasks assigned to you."
      });
    }

    if (["Todo", "In Progress", "Done"].includes(req.body.status)) {
      task.status = req.body.status;
      await task.save();

      if (req.body.status === "Done") {
        await User.updateMany(
          { currentTask: task._id },
          {
            workStatus: "online",
            todayWorkSummary: `Completed: ${task.title}`,
            $unset: { currentTask: "" },
            lastSeenAt: new Date()
          }
        );
      }
    }

    res.redirect("/tasks");
  } catch (error) {
    next(error);
  }
};
