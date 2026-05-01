const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRequestRoutes = require("./routes/adminRequestRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { attachUser } = require("./middleware/authMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(attachUser);

app.get("/", (req, res) => res.send("App Running"));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/admin-requests", adminRequestRoutes);
app.use("/profile", profileRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "The page you requested could not be found."
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong. Please try again."
  });
});

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

connectDatabase()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
