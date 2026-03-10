import Product from '../models/Product.model'
import { IProduct } from '../types/product.type'

import Category from '../models/Category.model'
import mongoose from 'mongoose'
import { IProductQuery } from '../types/query.type'

/* =============================== product create business logic ================================ */
export const createProductService = async (data: IProduct) => {
  return await Product.create({
    ...data,
    images: [],
    thumbnail: '',
  })
}

/* =============================== get products + dashboard stats ================================ */
export const getAllProductsService = async ({
  page = 1,
  limit = 10,
  search,
  categories,
  productId,
  sort,
  minPrice,
  maxPrice,
  isCombo,
  isFlashDeal,
  isTrending,
  status,
}: IProductQuery) => {
  const filter: any = {}

  /* =============================== Search Filter ================================ */
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    
    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { brand: { $regex: safeSearch, $options: 'i' } },
      { productID: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  /* =============================== Status Filter ================================ */
  if (status && status !== 'all') {
    filter.status = status
  }

  /* =============================== Category Filter ================================ */
  if (categories) {
    const categorySlug = Array.isArray(categories) ? categories[0] : categories

    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    }).select('_id')

    if (!category) {
      return {
        products: [],
        stats: {
          totalStock: 0,
          totalInventoryValue: 0,
          activeProducts: 0,
          lowStock: 0,
        },
        pagination: {
          page,
          limit,
          total_page: 0,
          total_product: 0,
        },
      }
    }

    filter.category = category._id
  }

  /* =============================== Product ID Filter ================================ */
  if (productId) {
    filter.productID = productId
  }

  /* =============================== Price Filter ================================ */
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    }
  }

  /* =============================== Flags ================================ */
  if (isFlashDeal === 'true') filter.isFlashDeal = true
  if (isCombo === 'true') filter.isCombo = true
  if (isTrending === 'true') filter.isTrending = true

  /* =============================== Sorting ================================ */
  let sortStage: any = { createdAt: -1 }

  if (sort) {
    const field = sort.startsWith('-') ? sort.slice(1) : sort
    const order = sort.startsWith('-') ? -1 : 1
    sortStage = { [field]: order }
  }

  /* =============================== Pagination ================================ */
  const skip = (page - 1) * limit

  /* =============================== Aggregation ================================ */
  const result = await Product.aggregate([
    { $match: filter },

    {
      $facet: {
        /* =============================== Products ================================ */
        products: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },

          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },

          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],

        /* =============================== Total Products ================================ */
        totalCount: [{ $count: 'count' }],

        /* =============================== Inventory Stats ================================ */
        inventoryStats: [
          {
            $group: {
              _id: null,

              totalStock: {
                $sum: { $toInt: '$stock' },
              },

              totalInventoryValue: {
                $sum: {
                  $multiply: [{ $toDouble: '$price' }, { $toInt: '$stock' }],
                },
              },
            },
          },
        ],

        /* =============================== Active Products ================================ */
        activeProducts: [{ $match: { status: 'active' } }, { $count: 'count' }],

        /* =============================== Low Stock ================================ */
        lowStock: [{ $match: { stock: { $lt: 10 } } }, { $count: 'count' }],
      },
    },
  ])

  const data = result[0]

  const total_product = data?.totalCount?.[0]?.count || 0

  const inventoryStats = data?.inventoryStats?.[0] || {
    totalStock: 0,
    totalInventoryValue: 0,
  }

  return {
    products: data.products || [],

    stats: {
      totalStock: inventoryStats.totalStock,
      totalInventoryValue: inventoryStats.totalInventoryValue,
      activeProducts: data?.activeProducts?.[0]?.count || 0,
      lowStock: data?.lowStock?.[0]?.count || 0,
    },
    pagination: {
      page,
      limit,
      total_page: Math.max(1, Math.ceil(total_product / limit)),
      total_product,
    },
  }
}
/* =============================== get single product  business logic ================================ */
export const getSingleProductService = async (id: string) => {
  const product = await Product.findById(id)
  if (!product) {
    throw new Error('Product not found')
  }
  return product
}
/* =============================== update single product  business logic ================================ */
/* =============================== update product business logic ================================ */
export const updatProductService = async (id: string, payload: Partial<IProduct>) => {
  return await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
}
