const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

exports.index = async (req, res, next) => {
  try {
    const projectFilter =
      req.user.role === "admin"
        ? { createdBy: req.user._id }
        : { members: req.user._id };

    const [projects, users] = await Promise.all([
      Project.find(projectFilter)
        .populate("members", "name email role")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 }),
      User.find().select("name email role workStatus").sort({ name: 1 })
    ]);

    res.render("projects/index", {
      title: "Projects",
      projects,
      users,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const projectFilter =
      req.user.role === "admin"
        ? { _id: req.params.id, createdBy: req.user._id }
        : { _id: req.params.id, members: req.user._id };

    const project = await Project.findOne(projectFilter)
      .populate("members", "name email role")
      .populate("createdBy", "name");

    if (!project) {
      return res.status(404).render("error", {
        title: "Project Not Found",
        message: "This project does not exist or you do not have access to it."
      });
    }

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((task) => task.status === "Done").length;
    const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.render("projects/show", {
      title: project.name,
      project,
      tasks,
      progress
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.redirect("/projects");
    }

    await Project.create({
      name,
      description,
      members: [req.user._id],
      createdBy: req.user._id
    });

    res.redirect("/projects");
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    await Project.findOneAndUpdate({
      _id: req.params.id,
      createdBy: req.user._id
    }, {
      $addToSet: { members: req.body.userId }
    });

    res.redirect("/projects");
  } catch (error) {
    next(error);
  }
};
