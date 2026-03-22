import Product from '../models/Product.model'
import { IProduct } from '../types/product.type'

import Category from '../models/Category.model'
import { IProductQuery } from '../types/query.type'

/* =============================== product create business logic ================================ */
export const createProductService = async (data: IProduct) => {
  return await Product.create(data)
}

/* =============================== get all products ================================ */

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

  /* =============================== Search ================================ */

  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { brand: { $regex: safeSearch, $options: 'i' } },
      { productID: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  /* =============================== Status ================================ */

  if (status && status !== 'all') {
    filter.status = status
  }

  /* =============================== Category ================================ */

  if (categories) {
    const categorySlug = Array.isArray(categories) ? categories[0] : categories

    const category = await Category.findOne({
      slug: categorySlug,
      isActive: true,
    }).select('_id')

    if (!category) {
      return {
        products: [],
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

  /* =============================== Product ID ================================ */

  if (productId) {
    filter.productID = productId
  }

  /* =============================== Price ================================ */

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

  /* =============================== Query ================================ */

  const [products, total_product] = await Promise.all([
    Product.find(filter).populate('category').sort(sortStage).skip(skip).limit(limit),

    Product.countDocuments(filter),
  ])

  /* =============================== Return ================================ */

  return {
    products,
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

/* =============================== get product stats service ================================ */

export const getProductStatsService = async () => {
  const stats = await Product.aggregate([
    {
      $facet: {
        /* =============================== TOTAL PRODUCTS ================================ */

        totalProducts: [{ $count: 'count' }],

        /* =============================== ACTIVE PRODUCTS ================================ */

        activeProducts: [{ $match: { status: 'active' } }, { $count: 'count' }],

        /* =============================== LOW STOCK ================================ */

        lowStock: [{ $match: { stock: { $lt: 10 } } }, { $count: 'count' }],

        /* =============================== INVENTORY ================================ */

        inventoryStats: [
          {
            $group: {
              _id: null,

              totalStock: {
                $sum: '$stock',
              },

              totalInventoryValue: {
                $sum: {
                  $multiply: ['$price', '$stock'],
                },
              },
            },
          },
        ],
      },
    },
  ])

  const data = stats[0]

  const inventory = data?.inventoryStats?.[0] || {
    totalStock: 0,
    totalInventoryValue: 0,
  }

  return {
    totalProducts: data?.totalProducts?.[0]?.count || 0,

    activeProducts: data?.activeProducts?.[0]?.count || 0,

    lowStock: data?.lowStock?.[0]?.count || 0,

    totalStock: inventory.totalStock,

    totalInventoryValue: inventory.totalInventoryValue,
  }
}
