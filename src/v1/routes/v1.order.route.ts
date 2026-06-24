import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrderStats,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/v1.order.controller";
import { authorizeRoles, verifyToken } from "../../middlewares/auth.middleware";

const router = Router();
router.post("/order", verifyToken, createOrder);
router.get(
  "/admin/orders",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getAllOrders,
);
router.get("/orders", verifyToken, getUserOrders);
router.get("/orders/stats", getOrderStats);
router.patch("/order/cancel/:orderId", verifyToken, cancelOrder);

router.patch(
  "/order/order-status/:orderId",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  updateOrderStatus,
);
router.patch(
  "/order/payment-status/:orderId",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  updatePaymentStatus,
);
export default router;
