import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import { uploadMultipleImages } from "../../middlewares/image.upload";
import { parseTags } from "../../utils/parsedTags";
import {
  createProductService,
  getAllProductsService,
  getProductStatsService,
  getSingleProductService,
  updatProductService,
} from "../../services/product.service";
import cloudinary from "../../utils/cloudinary";
import Product from "../../models/Product.model";
import Category from "../../models/Category.model";
import { AppError } from "../../utils/AppError";

/* =============================== CREATE PRODUCT ================================ */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let uploadedImages: {
    url: string;
    publicId: string;
  }[] = [];
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discount,
      stock,
      isTrending,
      isFlashDeal,
      isCombo,
      tags,
      status,
    } = req.body;

    const images = req.files as Express.Multer.File[];

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const isExist = await Category.exists({
      _id: category,
    });

    if (!isExist) {
      throw new AppError("Category not found", 404);
    }

    if (images?.length) {
      uploadedImages = await uploadMultipleImages(images, "nexcart/products");
    }

    const convertTags = parseTags(tags);

    const productID = `PRD-${nanoid(8).toUpperCase()}`;
    // Ensure inputs are valid numbers
    const numericPrice = Number(price);
    const numericDiscount = discount !== undefined ? Number(discount) : 0;
    const numericStock = Number(stock);
    /* =============================== FINAL PRICE ================================ */
    const rawFinalPrice = numericPrice - (numericPrice * numericDiscount) / 100;
    const finalPrice = Math.round(rawFinalPrice * 100) / 100;
    const product = await createProductService({
      productID,
      name,
      description,
      category,
      brand,
      price: numericPrice,
      discount: numericDiscount,
      finalPrice,
      stock: numericStock,
      isTrending,
      isFlashDeal,
      isCombo,
      tags: convertTags,
      images: uploadedImages,
      thumbnail: uploadedImages[0] || "",
      status,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    await Promise.all(
      uploadedImages.map((img) => cloudinary.uploader.destroy(img.publicId)),
    );

    next(error);
  }
};
/* =============================== get all products controller ================================ */
export const getAllProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const search = (query.search as string) || "";
    const categories = (query.categories as string) || "";
    const productId = (query.productId as string) || "";
    const sort = (query.sort as string) || "";
    const minPrice = (query.minPrice as string) || "";
    const maxPrice = (query.maxPrice as string) || "";
    const status = (query.status as string) || "";
    const isCombo = (query.isCombo as string) || "";
    const isFlashDeal = (query.isFlashDeal as string) || "";
    const isTrending = (query.isTrending as string) || "";
    const isAdmin = (query.isAdmin as string) || "";



    

    const select = query.select
      ? (query.select as string).split(",").join(" ")
      : "";
    /* =============================== Soft Delete ================================ */

    const result = await getAllProductsService({
      page,
      limit,
      select,
      search,
      categories,
      productId,
      sort,
      minPrice,
      maxPrice,
      status,
      isCombo,
      isFlashDeal,
      isTrending,
      isAdmin,
    });

    if (page > result.pagination.total_page) {
      return res.status(400).json({
        success: false,
        message: "Page number exceeds total pages",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
/* =============================== get single product  controller ================================ */

export const getSingleProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await getSingleProductService(id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
/* =============================== delete product  controller ================================ */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }
    /* =============================== DELETE IMAGES ================================ */
    if (product?.images.length) {
      await Promise.all(
        product?.images.map((image: any) => {
          return cloudinary.uploader.destroy(image.publicId);
        }),
      );
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =============================== UPDATE PRODUCT ================================ */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    /* =============================== FIND EXISTING ================================ */
    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      category,
      brand,
      price,
      discount,
      stock,
      isTrending,
      isFlashDeal,
      isCombo,
      tags,
      status,
    } = req.body;

    const convertTags = parseTags(tags);

    const images = req.files as Express.Multer.File[];

    /* =============================== SAFE VALUES ================================ */
    const newPrice = price !== undefined ? Number(price) : existing.price;

    const newDiscount =
      discount !== undefined ? Number(discount) : existing.discount || 0;

    /* =============================== FINAL PRICE ================================ */
    const finalPrice = newPrice - (newPrice * newDiscount) / 100;

    /* =============================== PAYLOAD ================================ */
    const updatePayload: any = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(brand !== undefined && { brand }),

      ...(price !== undefined && { price: newPrice }),
      ...(discount !== undefined && { discount: newDiscount }),
      ...(stock !== undefined && { stock: Number(stock) }),

      ...(isTrending !== undefined && { isTrending }),
      ...(isFlashDeal !== undefined && { isFlashDeal }),
      ...(isCombo !== undefined && { isCombo }),

      ...(convertTags && { tags: convertTags }),
      ...(status !== undefined && { status }),

      finalPrice, // ✅ ALWAYS UPDATE
    };

    /* =============================== IMAGE UPDATE ================================ */
    if (images?.length > 0) {
      /* delete old cloudinary images */

      if (existing.images?.length) {
        await Promise.all(
          existing.images.map((image: any) =>
            cloudinary.uploader.destroy(image.publicId),
          ),
        );
      }

      /* upload new images */

      const uploadedImages = await uploadMultipleImages(
        images,
        "nexcart/products",
      );

      updatePayload.images = uploadedImages;
      updatePayload.thumbnail = uploadedImages[0];
    }

    /* =============================== UPDATE PRODUCT ================================ */
    const product = await updatProductService(id, updatePayload);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
/* =============================== get product stats ================================ */

export const getProductStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await getProductStatsService();

    res.status(200).json({
      success: true,
      message: "Product stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
