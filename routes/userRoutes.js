import express from "express";
import {
  createUser,
  getCurrentUser,
  getUserById,
  getUsers,
  loginUser,
} from "../controllers/userController.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/profile", authenticateToken, getCurrentUser);
router.get("/all", authenticateToken, requireAdmin, getUsers);
router.get("/:id", authenticateToken, getUserById);

export default router;
