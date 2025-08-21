import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({ message: "Category already exists" });
  }
  const category = await Category.create({ name });
  res.status(200).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
};

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: category,
  });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};
