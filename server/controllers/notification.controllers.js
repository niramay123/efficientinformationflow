import { Notification } from "../models/notification.models.js";
import { emitToUser } from "../utils/socketManager.js";
import mongoose from "mongoose";

// Create and emit a notification
export const createNotification = async (userId, message, taskId = null) => {
  try {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      message,
      taskId
    });

    // Emit real-time notification if user is online
    emitToUser(userId.toString(), "notification", notification);

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

// Fetch all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(req.user.id)
    })
      .sort({ timestamp: -1 })
      .lean();

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// --- THIS IS THE NEW FUNCTION ---
// It deletes all notifications associated with the logged-in user's ID.
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: new mongoose.Types.ObjectId(req.user.id) });
    res.status(200).json({ success: true, message: "All notifications cleared." });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ error: "Failed to clear notifications." });
  }
};
