/* =============================== IMPORTS ================================ */
import express from "express";
import {
  createCategory,
  getCategoriesTree,
  updateCategory,
  deleteCategory,
  getCategories,
  getSingleCategory,
} from "../controllers/v1.category.controller";
import upload from "../../middlewares/multer.middleware";
import { authorizeRoles } from "../../middlewares/auth.middleware";

const router = express.Router();

/* =============================== ROUTES ================================ */
router.post("/categories", upload.single("image"), createCategory);
router.get("/categories/:id", getSingleCategory);
router.get("/categories/tree", getCategoriesTree);
router.get("/categories", getCategories);
router.patch(
  "/categories/:id",
  upload.single("image"), // ✅ ADD

  updateCategory,
);
router.delete("/categories/:id", deleteCategory);

export default router;
