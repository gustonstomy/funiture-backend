import express from "express";
import {
  addReview,
  getProductReviews,
} from "../controllers/reviewsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:productId", authenticateToken, addReview);

router.get("/:productId", getProductReviews);

export default router;
