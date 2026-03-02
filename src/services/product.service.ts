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
  isCombo,
  isFlashDeal,
  isTrending,
}: IPagination) => {
  const filter: any = {}

  /* =============================== Search Filter ================================ */
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const matchingCategories = await Category.find({
      name: { $regex: safeSearch, $options: 'i' },
    }).select('_id')

    const categoryIds = matchingCategories.map((c) => c._id)

    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { brand: { $regex: safeSearch, $options: 'i' } },
      ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
    ]
  }

  /* =============================== Category Filter ================================ */
  if (categories) {
    const matchingCategories = await Category.find({
      name: { $regex: categories, $options: 'i' },
    }).select('_id')

    const categoryIds = matchingCategories.map((c) => c._id)

    if (categoryIds.length) {
      filter.category = { $in: categoryIds }
    }
  }

  /* =============================== ProductID Filter ================================ */
  if (productId) {
    filter.productID = productId
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

  const [products, total_product] = await Promise.all([
    Product.find(filter)
      .select(select || '')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .populate('category'),

    Product.countDocuments(filter),
  ])

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
