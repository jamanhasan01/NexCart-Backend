import mongoose from "mongoose";
import { ICategory } from "../types/category.type";

/* =============================== Category Schema ================================ */
const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    /* =============================== RELATION ================================ */
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, 
    },

    /* =============================== ORDER ================================ */
    order: {
      type: Number,
      default: 0,
    },
    image: {
      type: {
        url: String,
        publicId: String,
      },
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
