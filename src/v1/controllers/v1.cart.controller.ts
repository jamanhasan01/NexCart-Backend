/* =============================== controllers/cart.controller.js ================================ */

import { NextFunction, Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import Product from "../../models/Product.model";
import Cart from "../../models/Cart.model";

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    /* =============================== find existing cart ================================ */
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    /* =============================== check existing item ================================ */
    const existingItem = cart.items.find(
      (item: any) => item.product.toString() === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({ message: "Not enough stock available" });
      }

      existingItem.quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      /* ================= SAFE PRICE ================= */
      const price = product.finalPrice ?? product.price;
      cart.items.push({
        product: product._id,
        quantity,
        price: price,
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Added to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
/* =============================== Get Cart ================================ */

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",

      populate: {
        path: "category",

        select: "name slug",
      },
    });

    if (!cart) {
      return res.json({ items: [] });
    }

    // 🔥 Remove broken products automatically
    cart.items = cart.items.filter((item: any) => item.product !== null);

    await cart.save();

    res.json(cart);
  } catch (error) {
    next(error);
  }
};
/* =============================== updateCartItem ================================ */

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item: any) => item.product.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* =============================== STOCK VALIDATION ================================ */
    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items available`,
      });
    }

    item.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate(
      "items.product",
    );

    res.json({ items: updatedCart?.items });
  } catch (error) {
    next(error);
  }
};

/* =============================== removeCartItem ================================ */

export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId,
    );

    await cart.save();

    res.json({ message: "Removed form cart", data: cart });
  } catch (error) {
    next(error);
  }
};
