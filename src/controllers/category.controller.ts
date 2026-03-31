/* =============================== IMPORTS ================================ */
import { Response, NextFunction } from "express";
import {
  createCategoryService,
  getCategoryTreeService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service";
import { AuthRequest } from "../types/auth.type";

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
