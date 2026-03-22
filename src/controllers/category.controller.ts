import { NextFunction, Request, Response } from "express";
import {
  createProductCategoryService,
  deleteProductCategoryService,
  updateProductCategoryService,
} from "../services/category.service";
import Category from "../models/Category.model";

/* =============================== create product category  controller ================================ */
export const createProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      const err: any = new Error("Categories must be an array");
      err.statusCode = 400;
      throw err;
    }

    if (categories.length === 0) {
      const err: any = new Error("Provide at least one category");
      err.statusCode = 400;
      throw err;
    }

    const result = await createProductCategoryService(categories);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const select = req.query.select
      ? (req.query.select as string).split(",").join(" ")
      : "";
    const result = await Category.find()
      .select(select || "")
      .sort("-createdAt");
    const total = await Category.countDocuments();
    res.status(200).json({ success: true, data: result, total });
  } catch (error) {
    next(error);
  }
};

/* =============================== update product category controller ================================ */
export const updateProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id); // ✅ force string
    const payload = req.body;

    const result = await updateProductCategoryService(id, payload);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =============================== delete product category controller ================================ */
export const deleteProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id); // ✅ fix typescript error

    await deleteProductCategoryService(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
