import mongoose from "mongoose";

// --- NEW: A sub-schema to define the structure of a single comment ---
const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // Each comment will have its own createdAt/updatedAt
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    deadline: { type: Date, required: true },
    attachments: [String],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Todo", "In-Progress", "On-Hold", "Completed"],
      default: "Todo",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // --- NEW: An array to store all comments related to this task ---
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);

