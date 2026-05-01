const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    workStatus: {
      type: String,
      enum: ["online", "working", "leave", "offline"],
      default: "offline"
    },
    todayWorkSummary: {
      type: String,
      trim: true,
      default: "No update yet"
    },
    currentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
