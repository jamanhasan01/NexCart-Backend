import { Types } from "mongoose";
export type ProductStatus = "active" | "inactive" | "draft" | "archived";
/* =============================== Product Interface ================================ */
export interface IProductImage {
  url: string;
  publicId: string;
}
export interface IProduct {
  productID?: string;

  name: string;
  description: string;

  category: ICategory;
  brand?: string | null;

  price: number;
  discount?: number;
  finalPrice: number;
  stock: number;

  images: IProductImage[];
  thumbnail: IProductImage | undefined;
  isTrending: boolean;
  isFlashDeal: boolean;
  isCombo: boolean;

  tags: string[] |string;
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/* =============================== Category Interface ================================ */
export interface ICategory {
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/* =============================== update category payload ================================ */

export interface IUpdateCategory {
  name?: string;
  icon?: string;
}
