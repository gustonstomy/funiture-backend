// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userSummaryRoutes from "./routes/userSummaryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Import routes
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-summary", userSummaryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/category", categoryRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API is running!",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      tasks: "/api/tasks",
      userSummary: "/api/user-summary",
    },
  });
});

app.post("/", (req, res) => {
  res.json({ message: "POST request received", data: req.body });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

export default app;
