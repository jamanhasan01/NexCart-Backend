import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductStats,
  getSingleProduct,
  updateProduct,
} from "../controllers/v1.product.controller";
import upload from "../../middlewares/multer.middleware";
import { authorizeRoles, verifyToken } from "../../middlewares/auth.middleware";

const router = Router();
/* =============================== product routes ================================ */
router.post(
  "/products",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  upload.array("images", 5),
  createProduct,
);
router.get("/products", getAllProduct);
router.get("/products/stats", getProductStats);
router.get("/products/:id", getSingleProduct);
router.delete(
  "/products/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  deleteProduct,
);
router.patch(
  "/products/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  upload.array("images", 5),
  updateProduct,
);

export default router;
