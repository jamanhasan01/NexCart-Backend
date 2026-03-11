/* =============================== imports ================================ */

import Order from '../models/Order.model'
import Product from '../models/Product.model'
import { ICreateOrderPayload } from '../types/order.type'
import { IOrderQuery } from '../types/query.type'
import { removeOrderedItemsFromCart } from './cart.service'

/* =============================== create order ================================ */

export const createOrderService = async (userId: string, payload: ICreateOrderPayload) => {
  const items = []

  for (const item of payload.items) {
    const product = await Product.findById(item.product)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`)
    }

    items.push({
      product: product._id,
      productId: product.productID,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.thumbnail,
    })

    /* ================= reduce stock ================= */

    product.stock -= item.quantity
    await product.save()
  }

  const order = await Order.create({
    orderId: payload.orderId,
    user: userId,
    items,
    shippingAddress: payload.shippingAddress,
  })

  /* ================= clear cart ================= */

  await removeOrderedItemsFromCart(userId, items)

  return order
}
/* =============================== get all orders ================================ */

export const getAllOrderService = async ({ page = 1, limit = 10, search, status }: IOrderQuery) => {
  const filter: any = {}

  /* =============================== search ================================ */

  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.orderId = { $regex: safeSearch, $options: 'i' }
  }

  /* =============================== status ================================ */

  if (status && status !== 'all') {
    filter.status = status
  }

  /* =============================== pagination ================================ */

  const skip = (page - 1) * limit

  const [orders, total_orders] = await Promise.all([
    Order.find(filter).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit),

    Order.countDocuments(filter),
  ])

  return {
    orders,

    pagination: {
      page,
      limit,
      total_page: Math.max(1, Math.ceil(total_orders / limit)),
      total_orders,
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

/* =============================== get order stats ================================ */

export const getOrderStatsService = async () => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const result = await Order.aggregate([
    {
      $facet: {
        /* ================= status stats ================= */

        statusStats: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],

        /* ================= total items sold ================= */

        totalItemsSold: [
          { $match: { status: 'delivered' } },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              items: { $sum: '$items.quantity' },
            },
          },
        ],

        /* ================= total revenue ================= */

        totalRevenue: [
          { $match: { status: 'delivered' } },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: {
                  $multiply: ['$items.quantity', '$items.price'],
                },
              },
            },
          },
        ],

        /* ================= today sales ================= */

        todaySales: [
          {
            $match: {
              status: 'delivered',
              createdAt: { $gte: last24Hours },
            },
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: {
                  $multiply: ['$items.quantity', '$items.price'],
                },
              },
            },
          },
        ],

        /* ================= monthly sales ================= */

        monthlySales: [
          {
            $match: {
              status: 'delivered',
              createdAt: { $gte: startOfMonth },
            },
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: {
                  $multiply: ['$items.quantity', '$items.price'],
                },
              },
            },
          },
        ],
      },
    },
  ])

  const data = result[0]

  const statusStats: any = {}

  data.statusStats.forEach((s: any) => {
    statusStats[s._id] = s.count
  })

  return {
    pending: statusStats.pending || 0,
    confirmed: statusStats.confirmed || 0,
    processing: statusStats.processing || 0,
    shipped: statusStats.shipped || 0,
    delivered: statusStats.delivered || 0,
    cancelled: statusStats.cancelled || 0,

    totalRevenue: data?.totalRevenue?.[0]?.revenue || 0,
    totalItemsSold: data?.totalItemsSold?.[0]?.items || 0,
    todaySales: data?.todaySales?.[0]?.revenue || 0,
    monthlySales: data?.monthlySales?.[0]?.revenue || 0,
  }
}
