import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  deleteCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-to-cart", authenticateToken, addToCart);
router.get("/get-cart", authenticateToken, getCart);
router.put("/update-cart", authenticateToken, updateCart);
router.delete("/delete-cart/:itemId", authenticateToken, deleteCart);
router.delete("/clear-cart", authenticateToken, clearCart);

export default router;
