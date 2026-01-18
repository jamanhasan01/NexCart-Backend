import { NextFunction, Request, Response } from "express";
import { createProductCategoryService } from "../services/category.service";
import Category from "../models/Category.model";

/* =============================== create product category  controller ================================ */
export const createProductCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const result = await Category.find();
    const total = await Category.countDocuments();
    res.status(200).json({ success: true, data: result, total });
  } catch (error) {
    next(error);
  }
};
