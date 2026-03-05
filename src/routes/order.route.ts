import { Router } from 'express'
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getUserOrders,
} from '../controllers/order.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()
router.post('/order', verifyToken, createOrder)
router.get('/orders', verifyToken, getAllOrders)
router.get('/orders/my-orders', verifyToken, getUserOrders)
router.patch('/order/cancel/:orderId', verifyToken, deleteOrder)
export default router
