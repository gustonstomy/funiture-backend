import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  updateProductImages,
} from "../controllers/productController.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// const upload = multer({ storage: multer.memoryStorage() });
router.post(
  "/createProduct",
  authenticateToken,
  upload.array("images", 5),
  requireAdmin,
  createProduct
);
router.get("/allProducts", getProducts);
router.get("/:id", getProductById);
router.put("/:id", authenticateToken, requireAdmin, updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, deleteProduct);
router.delete("/:productId/images/:publicId", deleteProductImage);
router.put(
  "/:productId/images",
  upload.array("images", 5),
  updateProductImages
);

export default router;
