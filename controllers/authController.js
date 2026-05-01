const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminRequest = require("../models/AdminRequest");
const User = require("../models/User");

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.showSignup = (req, res) => {
  res.render("auth/signup", { title: "Signup", error: null, form: {} });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render("auth/signup", {
        title: "Signup",
        error: "Name, email, and password are required.",
        form: req.body
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).render("auth/signup", {
        title: "Signup",
        error: "An account with this email already exists.",
        form: req.body
      });
    }

    const wantsAdmin = requestedRole === "admin";
    const adminCount = await User.countDocuments({ role: "admin" });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: wantsAdmin && adminCount === 0 ? "admin" : "member",
      workStatus: "online",
      todayWorkSummary: "Joined the workspace today",
      lastSeenAt: new Date()
    });

    if (wantsAdmin && adminCount > 0) {
      await AdminRequest.create({ user: user._id });
    }

    user.workStatus = user.workStatus === "leave" ? "leave" : "online";
    user.lastSeenAt = new Date();
    await user.save();

    res.cookie("token", createToken(user), cookieOptions);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

exports.showLogin = (req, res) => {
  res.render("auth/login", { title: "Login", error: null, form: {} });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const passwordMatches = user
      ? await bcrypt.compare(password || "", user.password)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).render("auth/login", {
        title: "Login",
        error: "Invalid email or password.",
        form: req.body
      });
    }

    res.cookie("token", createToken(user), cookieOptions);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  if (req.user) {
    User.findByIdAndUpdate(req.user._id, {
      workStatus: "offline",
      lastSeenAt: new Date()
    }).catch((error) => console.error(error));
  }

  res.clearCookie("token");
  res.redirect("/auth/login");
};
