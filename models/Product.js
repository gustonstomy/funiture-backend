import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    asset_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      default: "",
    },
    // Additional useful fields from Cloudinary
    // width: {
    //   type: Number,
    // },
    // height: {
    //   type: Number,
    // },
    // bytes: {
    //   type: Number,
    // },
    // resource_type: {
    //   type: String,
    //   default: "image",
    // },
    // created_at: {
    //   type: Date,
    // },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: {
    type: [imageSchema],
    validate: {
      validator: function (images) {
        return images && images.length > 0;
      },
      message: "Product must have at least one image",
    },
  },

  stock: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: [reviewSchema],
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
