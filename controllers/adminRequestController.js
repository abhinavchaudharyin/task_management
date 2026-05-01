const AdminRequest = require("../models/AdminRequest");
const User = require("../models/User");

exports.approve = async (req, res, next) => {
  try {
    const adminRequest = await AdminRequest.findById(req.params.id);
    if (!adminRequest || adminRequest.status !== "pending") {
      return res.redirect("/dashboard");
    }

    await User.findByIdAndUpdate(adminRequest.user, { role: "admin" });

    adminRequest.status = "approved";
    adminRequest.reviewedBy = req.user._id;
    adminRequest.reviewedAt = new Date();
    await adminRequest.save();

    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const adminRequest = await AdminRequest.findById(req.params.id);
    if (!adminRequest || adminRequest.status !== "pending") {
      return res.redirect("/dashboard");
    }

    adminRequest.status = "rejected";
    adminRequest.reviewedBy = req.user._id;
    adminRequest.reviewedAt = new Date();
    await adminRequest.save();

    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};
