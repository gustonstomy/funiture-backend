import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;

// This code defines the routes for the task management API. It uses Express.js to create a router and defines the following routes:
// - POST /: Create a new task
// - GET /: Get all tasks
// - PUT /:id: Update a task by ID
// - DELETE /:id: Delete a task by ID
// The routes are linked to the corresponding controller functions defined in taskController.js. The router is then exported for use in the main server file.
