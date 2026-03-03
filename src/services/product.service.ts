import { error } from 'node:console'
import Product from '../models/Product.model'
import { IProduct } from '../types/product.type'
import { IPagination } from '../types/query.type'
import Category from '../models/Category.model'
import mongoose from 'mongoose'

/* =============================== product create business logic ================================ */
export const createProductService = async (data: IProduct) => {
  return await Product.create({
    ...data,
    images: [],
    thumbnail: '',
  })
}

/* =============================== get all product  business logic ================================ */
export const getAllProductsService = async ({
  page = 1,
  limit = 10,
  select,
  search,
  categories,
  productId,
  sort,
  minPrice,
  maxPrice,
  isCombo,
  isFlashDeal,
  isTrending,
}: IPagination) => {
  const filter: any = {}

  /* =============================== Search Filter ================================ */
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { brand: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  /* =============================== Category Filter ================================ */
  if (categories) {
    const category = Array.isArray(categories) ? categories[0] : categories

    const categoryId = await Category.findOne({
      slug: category,
      isActive: true, // ✅ only active category allowed
    }).select('_id')

    if (categoryId) {
      filter.category = categoryId._id
    } else {
      // ❗ If category inactive or not found → return empty
      return {
        products: [],
        total_product: 0,
        page,
        limit,
        total_page: 0,
      }
    }
  }

  /* =============================== ProductID Filter ================================ */
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
  const sortOptions: any = {}

  if (sort) {
    const nameOfSort = sort.startsWith('-') ? sort.slice(1) : sort
    const sortOrder = sort.startsWith('-') ? -1 : 1
    sortOptions[nameOfSort] = sortOrder
  }

  /* =============================== Pagination ================================ */
  const skip = (page - 1) * limit

  /* =============================== Fetch Products ================================ */
  const productsRaw = await Product.find(filter)
    .select(select || '')
    .skip(skip)
    .limit(limit)
    .sort(sortOptions)
    .populate({
      path: 'category',
      match: { isActive: true }, // ✅ global safety
    })

  // 🔥 Remove products with inactive category
  const products = productsRaw.filter((p) => p.category !== null)

  const total_product = products.length

  return {
    products,
    total_product,
    page,
    limit,
    total_page: Math.max(1, Math.ceil(total_product / limit)),
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
