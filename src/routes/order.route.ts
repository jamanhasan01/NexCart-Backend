import { Router } from 'express'
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrderStats,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/order.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()
router.post('/order', verifyToken, createOrder)
router.get('/orders', verifyToken, getAllOrders)
router.get('/orders/my-orders', verifyToken, getUserOrders)
router.get('/orders/stats', getOrderStats)
router.patch('/order/cancel/:orderId', verifyToken, cancelOrder)
router.patch('/order/cancel/:orderId', verifyToken, cancelOrder)
router.patch('/order/order-status/:orderId', verifyToken, updateOrderStatus)
router.patch('/order/payment-status/:orderId', verifyToken, updatePaymentStatus)
export default router
