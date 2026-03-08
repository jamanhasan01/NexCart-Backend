/* =============================== imports ================================ */

import Order from '../models/Order.model'
import Product from '../models/Product.model'
import { ICreateOrderPayload } from '../types/order.type'
import { IOrderQuery } from '../types/query.type'
import { removeOrderedItemsFromCart } from './cart.service'

/* =============================== create order ================================ */

export const createOrderService = async (userId: string, payload: ICreateOrderPayload) => {
  const items = []
  let subtotal = 0

  for (const item of payload.items) {
    const product = await Product.findById(item.product)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`)
    }

    subtotal += product.price * item.quantity

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    })

    /* ================= reduce stock ================= */

    product.stock -= item.quantity
    await product.save()
  }

  const shipping = 60
  const total = subtotal + shipping

  const order = await Order.create({
    orderId: payload.orderId,
    user: userId,
    items,
    shippingAddress: payload.shippingAddress,
    subtotal,
    shipping,
    total,
  })

  /* ================= clear cart ================= */

  await removeOrderedItemsFromCart(userId, items)

  return order
}

export const getAllOrderService = async ({ page, limit, select, search, status }: IOrderQuery) => {
  const query: any = {}

  /* =============================== search ================================ */

  if (search) {
    query.orderId = { $regex: search, $options: 'i' }
  }

  /* =============================== status filter ================================ */

  if (status && status !== 'all') {
    query.status = status
  }

  /* =============================== pegination  ================================ */
  const total_order = await Order.countDocuments(query)
  const total_page = Math.ceil(total_order / limit)
  const skip = (page - 1) * limit
  /* =============================== payload of object  ================================ */
  const order = await Order.find(query)
    .skip(skip)
    .limit(limit)
    .select(select || '')
    .populate('user', 'name  email  phone')
    .populate('items.product', 'productID name price thumbnail')
    .sort({ createdAt: -1 })

  return {
    order,
    pagination: {
      total_page,
      limit,
      total_order,
    },
  }
}
export const getUserOrdersService = async ({
  page,
  limit,
  select,
  userId,
  search,
  status,
}: IOrderQuery) => {
  /* =============================== base query ================================ */

  const query: any = { user: userId }

  /* =============================== search ================================ */

  if (search) {
    query.orderId = { $regex: search, $options: 'i' }
  }

  /* =============================== status filter ================================ */

  if (status && status !== 'all') {
    query.status = status
  }

  /* =============================== pegination  ================================ */
  const total_order = await Order.countDocuments(query)
  const total_page = Math.ceil(total_order / limit)
  const skip = (page - 1) * limit
  /* =============================== payload of object  ================================ */

  const order = await Order.find(query)
    .skip(skip)
    .limit(limit)
    .select(select || '')
    .populate('user', 'name  email  phone')
    .populate('items.product', 'productID name price thumbnail')
    .sort({ createdAt: -1 })

  return {
    order,
    pagination: {
      total_page,
      limit,
      total_order,
    },
  }
}
