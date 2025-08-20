import Product from "../models/Product.js";
import router from "../routes/taskRoutes.js";
import cloudinary from "../utils/cloudinary.js";

const uploadImage = async (imagePath) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    // console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const result = await uploadImage(file.path);

      // Extract the fields you want from the Cloudinary response
      return {
        public_id: result.public_id,
        asset_id: result.asset_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        isPrimary: index === 0, // First image is primary
        // You can add more fields from the Cloudinary response as needed
        // width: result.width,
        // height: result.height,
        // bytes: result.bytes,
        // created_at: result.created_at,
      };
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, size, color, reviews } =
      req.body;

    // if (!name || !description || !price || !category || !image || !stock || !size || !color) {
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }
    const reviewsData = reviews ? JSON.parse(reviews) : [];

    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const images = await uploadMultipleImages(files);
    if (!images) {
      return res.status(400).json({ message: "Image is required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      stock,
      size,
      color,
      reviews: reviewsData || [],
    });

    console.log("product", product);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, category, stock, size, color } = req.body;

//     const image = await uploadImage(req.file.path);

//     const product = await Product.findByIdAndUpdate(
//       id,
//       { name, description, price, category, image, stock, size, color },
//       { new: true }
//     );
//     res
//       .status(200)
//       .json({ message: "Product updated successfully", data: product });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update product",
//       error: error.message,
//     });
//   }
// };

// export const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndDelete(id);

//     const deletedImage = await deleteImage(product.images[0].public_id);
//     console.log("deletedImage", deletedImage);

//     res.status(200).json({
//       success: true,
//       message: "Product deleted successfully",
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete product",
//       error: error.message,
//     });
//   }
// };

// 1. Delete a specific image from a product

export const deleteProductImage = async (req, res) => {
  try {
    const { productId, publicId } = req.params;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if image exists in product
    const imageIndex = product.images.findIndex(
      (img) => img.public_id === publicId
    );
    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    // Remove from product
    product.images.splice(imageIndex, 1);

    // If deleted image was primary and there are other images, make first one primary
    if (
      product.images.length > 0 &&
      !product.images.some((img) => img.isPrimary)
    ) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

// 2. Delete entire product (with all images)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    // console.log("product", id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all images from Cloudinary
    const deletePromises = product.images.map((image) =>
      deleteImage(image.public_id)
    );
    await Promise.allSettled(deletePromises); // Use allSettled to continue even if some fail

    // Delete product from database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product and all images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      description,
      price,
      category,
      stock,
      size,
      color,
      reviews,
      imagesToDelete, // Array of public_ids to delete
      primaryImageId, // public_id of image to set as primary
    } = req.body;

    // Find existing product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle image deletions
    if (imagesToDelete && imagesToDelete.length > 0) {
      // Delete from Cloudinary
      const deletePromises = imagesToDelete.map((publicId) =>
        deleteImage(publicId)
      );
      await Promise.allSettled(deletePromises);

      // Remove from product
      product.images = product.images.filter(
        (img) => !imagesToDelete.includes(img.public_id)
      );
    }

    // Handle new image uploads
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      const newImages = await uploadMultipleImages(files);
      product.images.push(...newImages);
    }

    // Update primary image
    if (primaryImageId) {
      product.images.forEach((img) => {
        img.isPrimary = img.public_id === primaryImageId;
      });
    }

    // Ensure at least one image is primary if images exist
    if (
      product.images.length > 0 &&
      !product.images.some((img) => img.isPrimary)
    ) {
      product.images[0].isPrimary = true;
    }

    // Update other fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (size) product.size = size;
    if (color) product.color = color;
    if (reviews) product.reviews = JSON.parse(reviews);

    product.updatedAt = new Date();

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Update only product images
export const updateProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { primaryImageId, imagesToDelete } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete specified images
    if (imagesToDelete && imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map((publicId) =>
        deleteImage(publicId)
      );
      await Promise.allSettled(deletePromises);

      product.images = product.images.filter(
        (img) => !imagesToDelete.includes(img.public_id)
      );
    }

    // Add new images
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      const newImages = await uploadMultipleImages(files);
      product.images.push(...newImages);
    }

    // Set new primary image
    if (primaryImageId) {
      product.images.forEach((img) => {
        img.isPrimary = img.public_id === primaryImageId;
      });
    }

    // Ensure at least one image is primary
    if (
      product.images.length > 0 &&
      !product.images.some((img) => img.isPrimary)
    ) {
      product.images[0].isPrimary = true;
    }

    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product images:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product images",
      error: error.message,
    });
  }
};
