import express from 'express';
// --- NEW: Import the clearAllNotifications function ---
import { getNotifications, clearAllNotifications } from '../controllers/notification.controllers.js';
// --- FIX: Removed isOperator, as any logged-in user should be able to get their notifications ---
import { isAuth } from '../middlewares/isAuth.middlewares.js';

const router = express.Router();

// GET /api/notifications - Fetches all notifications for the logged-in user
router.get('/', isAuth, getNotifications);

// --- NEW: DELETE /api/notifications - Deletes all notifications for the logged-in user ---
router.delete('/', isAuth, clearAllNotifications);

export default router;
