import { NextFunction, Response } from 'express'
import { AuthRequest } from '../types/auth.type'
import {
  createOrderService,
  getAllOrderService,
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
    const order = await getAllOrderService({ page, limit, select ,search, status})
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
}
