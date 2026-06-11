/* =============================== IMPORTS ================================ */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.type";
import { uploadImage } from "../../middlewares/image.upload";
import { createCategoryService, deleteCategoryService, getCategoriesService, getCategoryTreeService, updateCategoryService } from "../../services/category.service";
import Category from "../../models/Category.model";
import cloudinary from "../../utils/cloudinary";
import Product from "../../models/Product.model";


/* =============================== CREATE ================================ */

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let image = null;

    if (req.file) {
      image = await uploadImage(req.file, "nexcart/categories", 800, 80);
    }

    const payload = {
      ...req.body,
      image,
    };

    const result = await createCategoryService(payload);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
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

    return res.status(200).json({
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
    const result = await getCategoriesService(req.query);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
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
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const payload: any = {
      ...req.body,
    };

    /* =============================== REMOVE IMAGE ================================ */

    if (req.body.removeImage === "true") {
      if (existing.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId);
      }

      payload.image = null;
    }

    /* =============================== UPDATE IMAGE ================================ */

    if (req.file) {
      if (existing.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId);
      }

      payload.image = await uploadImage(
        req.file,
        "nexcart/categories",
        800,
        80,
      );
    }

    /* =============================== UPDATE CATEGORY ================================ */

    const result = await updateCategoryService(id, payload);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
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
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* =============================== CHECK PRODUCTS ================================ */

    const hasProducts = await Product.exists({
      category: id,
    });

    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category. Products are assigned to this category.",
      });
    }

    /* =============================== DELETE IMAGE ================================ */

    if (existing.image?.publicId) {
      await cloudinary.uploader.destroy(existing.image.publicId);
    }

    /* =============================== DELETE CATEGORY ================================ */

    await deleteCategoryService(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
