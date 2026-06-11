import { Document, Types } from "mongoose";

/* =============================== Category Image ================================ */

export interface ICategoryImage {
  url: string;
  publicId: string;
}

/* =============================== Category ================================ */

export interface ICategory extends Document {
  name: string;
  slug: string;

  parent?: Types.ObjectId | null;

  order: number;

  icon?: string | null;

  image?: ICategoryImage | null;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}