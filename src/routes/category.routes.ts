/* =============================== IMPORTS ================================ */
import express from "express";
import {
  createCategory,
  getCategoriesTree,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { createUploader } from "../middlewares/upload.middleware";
const { upload, optimizeImage } = createUploader("categories");

const router = express.Router();

/* =============================== ROUTES ================================ */
router.post("/categories", upload.single("image"), optimizeImage, createCategory);
router.get("/categories/tree", getCategoriesTree);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
