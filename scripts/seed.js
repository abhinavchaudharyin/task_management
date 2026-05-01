const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const AdminRequest = require("../models/AdminRequest");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const password = "Demo@12345";

const demoUsers = [
  {
    name: "Demo Admin",
    email: "admin@demo.com",
    role: "admin",
    workStatus: "online",
    todayWorkSummary: "Reviewing admin requests and project progress"
  },
  {
    name: "Asha Member",
    email: "asha@demo.com",
    role: "member",
    workStatus: "working",
    todayWorkSummary: "Working on landing page copy and task updates"
  },
  {
    name: "Rohan Member",
    email: "rohan@demo.com",
    role: "member",
    workStatus: "leave",
    todayWorkSummary: "On planned leave today"
  },
  {
    name: "Pending Admin",
    email: "pending-admin@demo.com",
    role: "member",
    workStatus: "online",
    todayWorkSummary: "Waiting for admin access approval"
  }
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const hashedPassword = await bcrypt.hash(password, 12);

  const users = {};
  for (const demoUser of demoUsers) {
    const user = await User.findOneAndUpdate(
      { email: demoUser.email },
      {
        $set: {
          name: demoUser.name,
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role,
          workStatus: demoUser.workStatus,
          todayWorkSummary: demoUser.todayWorkSummary,
          lastSeenAt: new Date()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    users[demoUser.email] = user;
  }

  await Promise.all([
    Project.deleteMany({ name: { $in: ["Website Launch", "Mobile App MVP"] } }),
    Task.deleteMany({
      title: {
        $in: [
          "Create landing page copy",
          "Design dashboard wireframes",
          "Connect MongoDB Atlas",
          "Prepare Railway deployment",
          "Build task status update flow"
        ]
      }
    }),
    AdminRequest.deleteMany({ user: users["pending-admin@demo.com"]._id })
  ]);

  const websiteProject = await Project.create({
    name: "Website Launch",
    description: "Marketing website launch tasks for the product team.",
    members: [
      users["admin@demo.com"]._id,
      users["asha@demo.com"]._id,
      users["rohan@demo.com"]._id
    ],
    createdBy: users["admin@demo.com"]._id
  });

  const appProject = await Project.create({
    name: "Mobile App MVP",
    description: "Core MVP delivery plan for the mobile app team.",
    members: [users["admin@demo.com"]._id, users["asha@demo.com"]._id],
    createdBy: users["admin@demo.com"]._id
  });

  const seededTasks = await Task.insertMany([
    {
      title: "Create landing page copy",
      description: "Draft concise copy for the public launch page.",
      project: websiteProject._id,
      assignedTo: [users["asha@demo.com"]._id, users["rohan@demo.com"]._id],
      status: "Todo",
      dueDate: daysFromNow(5),
      createdBy: users["admin@demo.com"]._id
    },
    {
      title: "Design dashboard wireframes",
      description: "Create dashboard layout options for admin and member views.",
      project: appProject._id,
      assignedTo: [users["rohan@demo.com"]._id],
      status: "In Progress",
      dueDate: daysFromNow(3),
      createdBy: users["admin@demo.com"]._id
    },
    {
      title: "Connect MongoDB Atlas",
      description: "Verify database connection and environment variables.",
      project: websiteProject._id,
      assignedTo: [users["asha@demo.com"]._id],
      status: "Done",
      dueDate: daysFromNow(-2),
      createdBy: users["admin@demo.com"]._id
    },
    {
      title: "Prepare Railway deployment",
      description: "Check start script, PORT usage, and production variables.",
      project: websiteProject._id,
      assignedTo: [users["rohan@demo.com"]._id],
      status: "In Progress",
      dueDate: daysFromNow(-1),
      createdBy: users["admin@demo.com"]._id
    },
    {
      title: "Build task status update flow",
      description: "Allow members to update assigned task status safely.",
      project: appProject._id,
      assignedTo: [users["asha@demo.com"]._id, users["rohan@demo.com"]._id],
      status: "Todo",
      dueDate: daysFromNow(7),
      createdBy: users["admin@demo.com"]._id
    }
  ]);

  await User.findByIdAndUpdate(users["asha@demo.com"]._id, {
    workStatus: "working",
    currentTask: seededTasks[0]._id,
    todayWorkSummary: `Working on: ${seededTasks[0].title}`,
    lastSeenAt: new Date()
  });

  await AdminRequest.create({
    user: users["pending-admin@demo.com"]._id,
    status: "pending"
  });

  console.log("Demo data seeded successfully");
  console.log("Login accounts:");
  console.log(`Admin: admin@demo.com / ${password}`);
  console.log(`Member: asha@demo.com / ${password}`);
  console.log(`Member: rohan@demo.com / ${password}`);
  console.log(`Pending admin request: pending-admin@demo.com / ${password}`);

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
