import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create-category",
  authenticateToken,
  requireAdmin,
  createCategory
);
router.get("/get-categories", authenticateToken, requireAdmin, getCategories);
router.get(
  "/get-category/:id",
  authenticateToken,
  requireAdmin,
  getCategoryById
);
router.put(
  "/update-category/:id",
  authenticateToken,
  requireAdmin,
  updateCategory
);
router.delete(
  "/delete-category/:id",
  authenticateToken,
  requireAdmin,
  deleteCategory
);

export default router;
