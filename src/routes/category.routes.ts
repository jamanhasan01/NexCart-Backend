import { Router } from "express";
import {
  createProductCategory,
  getAllCategories,
} from "../controllers/category.controller";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
/* =============================== category routes ================================ */
router.post("/categories", upload.none(), createProductCategory);

router.get("/categories", getAllCategories);

export default router;
