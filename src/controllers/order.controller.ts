import { NextFunction, Response } from 'express'
import { AuthRequest } from '../types/auth.type'
import {
  createOrderService,
  getAllOrderService,
  getOrderStatsService,
  getUserOrdersService,
} from '../services/order.service'
import { ICreateOrderPayload } from '../types/order.type'
import { nanoid } from 'nanoid'
import Order from '../models/Order.model'
import Product from '../models/Product.model'

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
    }

    const payload: ICreateOrderPayload = req.body

    const userId = req?.user?.userId
    const orderId = `ORD-${nanoid(8).toUpperCase()}`
    const order = await createOrderService(userId, { ...payload, orderId })

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const search = req.query.search as string
  const status = req.query.status as string
  const select = req.query.select as string

  try {
    const order = await getAllOrderService({ page, limit, select, search, status })
    res.status(200).json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}
export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const search = req.query.search as string
  const status = req.query.status as string
  const select = req.query.select as string
  const userId = req.user?.userId

  try {
    const order = await getUserOrdersService({ page, limit, select, userId, status, search })
    res.status(200).json({ success: true, data: order })
  } catch (error) {
    next(error)
  }
}

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId

  try {
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order already cancelled' })
    }
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ success: false, message: 'Order can not be cancelled' })
    }
    for (const item of order.items) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: item.quantity },
        },
        { new: true },
      )
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }
    }
    order.status = 'cancelled'
    await order.save()

    res.status(200).json({ success: true, message: 'Order cancelled successfully' })
  } catch (error) {
    next(error)
  }
}

/* =============================== update order status ================================ */
/* =============================== update order status ================================ */

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { orderId } = req.params
  const { orderStatus } = req.body

  const status = orderStatus?.toLowerCase()

  const allowedStatus = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order status',
    })
  }

  try {
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

  

    /* ================= prevent change after delivered/cancelled ================= */

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${order.status} order`,
      })
    }

    if (order.orderStatus === status) {
      return res.status(400).json({
        success: false,
        message: 'Order status already updated',
      })
    }

    order.status = status
    await order.save()

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}
/* =============================== update payment status ================================ */

export const updatePaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { orderId } = req.params
  const { paymentStatus } = req.body
  const status = paymentStatus?.toLowerCase()
  const allowedStatus = ['unpaid', 'paid', 'failed', 'refunded']

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status',
    })
  }
  try {
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    if (order.paymentStatus === status) {
      return res.status(400).json({
        success: false,
        message: 'Payment status already updated',
      })
    }

    order.paymentStatus = status
    await order.save()

    res.json({
      success: true,
      message: 'Payment status updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

/* =============================== get order stats ================================ */

export const getOrderStats = async  (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await getOrderStatsService()

    res.status(200).json({
      success: true,
      message: 'Order stats retrieved successfully',
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}
