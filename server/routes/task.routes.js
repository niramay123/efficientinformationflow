import { Router } from "express";
import { isAuth, isSupervisor, isOperator } from "../middlewares/isAuth.middlewares.js";
// Simplified imports to match the updated controller
import { createTask, deleteTask, editTask, getTasks, updateStatus } from "../controllers/task.controllers.js";

const router = Router();

// --- Main Route for Tasks ---
// POST to /api/tasks will create a task.
// GET to /api/tasks will fetch tasks based on the user's role.
router.route('/tasks')
  .post(isAuth, isSupervisor, createTask) 
  .get(isAuth, getTasks); 

// --- Routes for a specific task identified by its ID ---
// PUT to /api/tasks/:id will edit the task.
// DELETE to /api/tasks/:id will delete the task.
router.route('/tasks/:id')
  .put(isAuth, isSupervisor, editTask)
  .delete(isAuth, isSupervisor, deleteTask);

// --- Route for an Operator to update the status of a task ---
router.put('/tasks/:id/status', isAuth, isOperator, updateStatus);

export default router;

