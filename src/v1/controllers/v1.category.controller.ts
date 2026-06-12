/* =============================== IMPORTS ================================ */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.type";
import { uploadImage } from "../../middlewares/image.upload";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  getCategoryTreeService,
  updateCategoryService,
} from "../../services/category.service";
import Category from "../../models/Category.model";
import cloudinary from "../../utils/cloudinary";
import Product from "../../models/Product.model";
import { AppError } from "../../utils/AppError";

/* =============================== CREATE ================================ */

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let image = null;
  try {
    if (req.file) {
      image = await uploadImage(req.file, "nexcart/categories", 800, 80);
    }
    const parentId = req.body.parent;

    if (parentId) {
      const parentExists = await Category.exists({
        _id: parentId,
      });

      if (!parentExists) {
        throw new AppError("Parent category not found", 404);
      }
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
    if (image?.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
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
  let newImage: {
    url: string;
    publicId: string;
  } | null = null;

  try {
    const id = req.params.id as string;

    /* =============================== FIND EXISTING ================================ */

    const existing = await Category.findById(id);

    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    const payload: Record<string, any> = {
      ...req.body,
    };

    /* =============================== VALIDATE PARENT ================================ */

    if (payload.parent) {
      const parentExists = await Category.exists({
        _id: payload.parent,
      });

      if (!parentExists) {
        throw new AppError("Parent category not found", 404);
      }

      if (payload.parent === id) {
        throw new AppError("Category cannot be its own parent", 400);
      }
    }

    /* =============================== UPLOAD NEW IMAGE ================================ */

    if (req.file) {
      newImage = await uploadImage(req.file, "nexcart/categories", 800, 80);

      payload.image = newImage;
    }

    /* =============================== UPDATE CATEGORY ================================ */

    const result = await updateCategoryService(id, payload);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    /* =============================== CLEANUP NEW IMAGE ================================ */

    if (newImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(newImage.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary cleanup failed:", cloudinaryError);
      }
    }

    next(error);
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
      throw new AppError("Category not found", 404);
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
