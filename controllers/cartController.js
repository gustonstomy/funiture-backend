import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const addToCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  const userId = req.user.id;

  if (!productId || !size || !color) {
    return res.status(400).json({
      success: false,
      message: "Product ID, size, and color are required",
    });
  }

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid quantity is required",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  if (!product.isActive || product.isDeleted) {
    return res.status(400).json({
      success: false,
      message: "Product is not available",
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`,
    });
  }

  let cart = await Cart.findOne({ userId });
  const itemTotalPrice = product.price * quantity;

  if (cart) {
    const existingItemIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex !== -1) {
      cart.products[existingItemIndex].quantity += quantity;
      cart.products[existingItemIndex].totalPrice += itemTotalPrice;
      cart.totalCartPrice += itemTotalPrice;
    } else {
      cart.products.push({
        productId,
        quantity,
        size,
        color,
        price: product.price,
        image: product.images[0].url,
        name: product.name,
        totalPrice: itemTotalPrice,
        totalQuantity: quantity,
      });
      cart.totalCartPrice += itemTotalPrice;
    }
  } else {
    cart = await Cart.create({
      userId,
      products: [
        {
          productId,
          quantity,
          size,
          color,
          price: product.price,
          image: product.images[0].url,
          name: product.name,
          totalPrice: itemTotalPrice,
          totalQuantity: quantity,
        },
      ],
      totalCartPrice: itemTotalPrice,
    });
  }

  await cart.save();
  res.status(200).json({ success: true, message: "Product added to cart" });
};

export const getCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(200).json({
      success: true,
      message: "Cart not found",
      cartItems: [],
      totalCartPrice: 0,
      totalQuantity: 0,
    });
  }
  const cartItems = cart.products;
  const totalCartPrice = cart.totalCartPrice;
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  res.status(200).json({
    success: true,
    cartItems,
    totalCartPrice,
    totalQuantity,
  });
};

export const updateCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  const userId = req.user.id;
  const product = await Product.findById(productId);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  if (!product.isActive || product.isDeleted) {
    return res
      .status(400)
      .json({ success: false, message: "Product is not available" });
  }
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`,
    });
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid quantity is required",
    });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  const existingItemIndex = cart.products.findIndex(
    (item) =>
      item.productId.toString() === productId &&
      item.size === size &&
      item.color === color
  );
  if (existingItemIndex !== -1) {
    cart.products[existingItemIndex].quantity = quantity;
    cart.products[existingItemIndex].totalPrice = product.price * quantity;
    cart.products[existingItemIndex].color = color;
    cart.products[existingItemIndex].size = size;
    cart.products[existingItemIndex].updatedAt = Date.now();
    cart.totalCartPrice = cart.products.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );
  } else {
    cart.products.push({
      productId,
      quantity,
      size,
      color,
      price: product.price,
      image: product.images[0].url,
      name: product.name,
      totalPrice: product.price * quantity,
      totalQuantity: quantity,
    });
    cart.totalCartPrice += product.price * quantity;
  }
  await cart.save();
  res.status(200).json({ success: true, message: "Cart updated" });
};

export const deleteCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Check if item exists
    const itemExists = cart.products.some(
      (item) => item._id.toString() === itemId
    );
    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.products = cart.products.filter(
      (item) => item._id.toString() !== itemId
    );

    cart.totalCartPrice = cart.products.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    cart.updatedAt = new Date();

    await cart.save();

    const totalItems = cart.products.length;
    const totalQuantity = cart.products.reduce(
      (total, item) => total + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        cart,
        summary: {
          totalItems,
          totalQuantity,
          totalCartPrice: cart.totalCartPrice,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        products: [],
        totalCartPrice: 0,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        cart,
        summary: {
          totalItems: 0,
          totalQuantity: 0,
          totalCartPrice: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};
