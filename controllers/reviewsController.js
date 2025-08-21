import Product from "../models/Product.js";

export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create new review
    const newReview = {
      user: userId,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add review to product
    product.reviews.push(newReview);

    // Calculate new average rating
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = totalRating / product.reviews.length;
    product.updatedAt = new Date();

    await product.save();

    // Populate the user data for the response
    await product.populate("reviews.user", "name email");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: {
        review: product.reviews[product.reviews.length - 1],
        productRating: product.rating,
        totalReviews: product.reviews.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const product = await Product.findById(productId)
      .populate("reviews.user", "name email avatar")
      .select("reviews rating name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Sort reviews
    product.reviews.sort((a, b) => {
      if (sortBy === "rating") {
        return (a.rating - b.rating) * sortOrder;
      } else {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = product.reviews.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        reviews: paginatedReviews,
        productName: product.name,
        totalReviews: product.reviews.length,
        averageRating: product.rating,
        currentPage: page,
        totalPages: Math.ceil(product.reviews.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};
