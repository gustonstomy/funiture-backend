import express from "express";
import {
  createUser,
  getCurrentUser,
  getUserById,
  getUsers,
  loginUser,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/profile", authenticateToken, getCurrentUser);
router.get("/all", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserById);

export default router;
