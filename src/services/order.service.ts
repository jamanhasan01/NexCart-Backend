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
    console.log('products ', product)

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

  console.log(items)

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

export const getAllOrderService = async ({ page, limit, select }: IOrderQuery) => {
  const total_order = await Order.countDocuments()
  const total_page = Math.ceil(total_order / limit)
  const skip = (page - 1) * limit

  const order = await Order.find()
    .skip(skip)
    .limit(limit)
    .select(select || '')
    .populate('user', 'name  email  phone')
    .populate('items.product', 'productID name price thumbnail')

  return {
    order,
    pagination: {
      total_page,
      limit,
      total_order,
    },
  }
}
export const getUserOrdersService = async ({ page, limit, select, userId }: IOrderQuery) => {
  const total_order = await Order.countDocuments({ user: userId })
  const total_page = Math.ceil(total_order / limit)
  const skip = (page - 1) * limit

  const order = await Order.find({ user: userId })
    .skip(skip)
    .limit(limit)
    .select(select || '')
    .populate('user', 'name  email  phone')
    .populate('items.product', 'productID name price thumbnail')

  return {
    order,
    pagination: {
      total_page,
      limit,
      total_order,
    },
  }
}
