/* =============================== IMPORTS ================================ */
import express from "express";
import {
  createCategory,
  getCategoriesTree,
  updateCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller";
import upload  from "../middlewares/multer.middleware";


const router = express.Router();

/* =============================== ROUTES ================================ */
router.post(
  "/categories",
  upload.single("image"),

  createCategory,
);
router.get("/categories/tree", getCategoriesTree);
router.get("/categories", getCategories); // ✅ IMPORTANT
router.patch(
  "/categories/:id",
  upload.single("image"), // ✅ ADD

  updateCategory,
);
router.delete("/categories/:id", deleteCategory);

export default router;
