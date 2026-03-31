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
    console.log("upate ", result);

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

/* =============================== GET ALL / BY PARENT ================================ */
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { parent } = req.query;

    const filter: any = {};

    if (parent === "null") {
      filter.parent = null; // main categories
    } else if (parent) {
      filter.parent = parent; // subcategories
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
    const result = await updateCategoryService(id, req.body);

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
    await deleteCategoryService(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
