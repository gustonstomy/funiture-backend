import express from "express";
import {
  getUserSummary,
  getUsersByStatus,
  getUserAnalytics,
} from "../controllers/suerSummaryController.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes for user management and analytics
// Note: In production, these should be protected with admin authentication middleware

// GET /api/user-summary - Get overall user statistics
router.get("/", authenticateToken, requireAdmin, getUserSummary);

// GET /api/user-summary/users/:status - Get users by status (active, inactive, all)
// Query params: page, limit for pagination
router.get("/users/:status", authenticateToken, requireAdmin, getUsersByStatus);

// GET /api/user-summary/analytics - Get detailed user analytics
router.get("/analytics", authenticateToken, requireAdmin, getUserAnalytics);

export default router;
