import { Task } from "../models/task.models.js";
import { createNotification } from './notification.controllers.js';

// ... createTask, editTask, getTasks, and deleteTask functions remain the same ...

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      priority,
      assignedTo,
    } = req.body;

    if (!title || !description || !deadline || !priority || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, description, deadline, priority, assignedTo) are required",
      });
    }

    if (new Date(deadline) <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Deadline must be a future date",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      deadline: new Date(deadline),
      priority: priority || "Medium",
      assignedTo,
      createdBy: req.user._id, 
    });

    await task.populate('assignedTo', 'name email');
    await createNotification(assignedTo, `New task assigned: "${task.title}"`, task._id);

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      task: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, attachments, assignedTo } = req.body;

    const originalTask = await Task.findById(id);
    if (!originalTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, deadline, priority, attachments, assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (assignedTo && originalTask.assignedTo.toString() !== assignedTo) {
        await createNotification(assignedTo, `Task reassigned to you: "${updatedTask.title}"`, updatedTask._id);
        await createNotification(originalTask.assignedTo, `Task no longer assigned to you: "${updatedTask.title}"`, updatedTask._id);
    }

    res
      .status(200)
      .json({ success: true, message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'supervisor') {
      filter.createdBy = req.user._id;
    } else if (req.user.role === 'operator') {
      filter.assignedTo = req.user._id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    // --- NEW: Populate comments and the user who made the comment ---
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name role") // Populate user details within comments
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching tasks",
        error: error.message,
      });
  }
};

export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// --- THIS IS THE UPDATED FUNCTION ---
export const updateStatus = async (req, res) => {
  try {
    // A comment can now be passed in the body
    const { status, comment } = req.body;
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    task.status = status;

    // If the task is being completed and a comment is provided, add it to the task
    if (status === 'Completed' && comment) {
      task.comments.push({ text: comment, user: req.user._id });
    }

    await task.save();

    // Send a more descriptive notification if a comment was added
    let notificationMessage = `Task "${task.title}" status updated to ${status}.`;
    if (status === 'Completed' && comment) {
      notificationMessage = `Task "${task.title}" completed with a comment.`;
    }
    await createNotification(task.createdBy._id, notificationMessage, task._id);
    
    // Repopulate the comments to include the user details in the response
    await task.populate("comments.user", "name role");

    res.status(200).json({ success: true, message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: "Error updating status of task",
        error: error.message,
      });
  }
};

