/* =============================== IMPORTS ================================ */
import { Response, NextFunction } from "express";
import {
  createCategoryService,
  getCategoryTreeService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";
import { AuthRequest } from "../types/auth.type";
import Category from "../models/Category.model";
import fs from "fs";
import path from "path";
import Product from "../models/Product.model";

/* =============================== DELETE FILE ================================ */
const deleteFile = (filePath: string) => {
  try {
    if (!filePath) return;

    // prevent deleting external files
    if (filePath.startsWith("http")) return;

    const cleanPath = filePath.replace(/^\/+/, "");
    const fullPath = path.join("/data", cleanPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
     
    }
  } catch (error) {
    console.error("File delete error:", error);
  }
};

/* =============================== CREATE ================================ */
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const image = req.file ? `/uploads/category/${req.file.filename}` : null;

    const payload = {
      ...req.body,
      image,
    };

    const result = await createCategoryService(payload);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* =============================== GET TREE ================================ */
export const getCategoriesTree = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCategoryTreeService();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* =============================== GET ALL ================================ */
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { parent } = req.query;

    const filter: any = {};

    if (parent === "null") {
      filter.parent = null;
    } else if (parent) {
      filter.parent = parent;
    }

    const categories = await Category.find(filter).sort({ order: 1 }).lean();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

/* =============================== UPDATE ================================ */
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    /* =============================== FIND EXISTING ================================ */
    const existing = await Category.findById(id);

    if (!existing) {
      throw new Error("Category not found");
    }

    const payload: any = {
      ...req.body,
    };

    /* =============================== REMOVE IMAGE ================================ */
    if (req.body.removeImage === "true") {
      if (existing.image) {
        deleteFile(existing.image);
      }
      payload.image = null;
    }

    /* =============================== UPDATE IMAGE ================================ */
    if (req.file) {
      // delete old image
      if (existing.image) {
        deleteFile(existing.image);
      }

      // set new image
      payload.image = `/uploads/category/${req.file.filename}`;
    }

    const result = await updateCategoryService(id, payload);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* =============================== DELETE ================================ */
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    /* =============================== FIND EXISTING ================================ */
    const existing = await Category.findById(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    /* =============================== CHECK PRODUCTS ================================ */
    const hasProducts = await Product.exists({ category: id });

    if (hasProducts) {
      throw new Error(
        "Cannot delete category. Products are assigned to this category.",
      );
    }

    /* =============================== DELETE IMAGE ================================ */
    if (existing.image) {
      deleteFile(existing.image);
    }

    await deleteCategoryService(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
