import { error } from 'node:console'
import Product from '../models/Product.model'
import { IProduct } from '../types/product.type'
import { IPagination } from '../types/query.type'
import Category from '../models/Category.model'

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
  page,
  limit,
  select,
  search,
  sort,
  isCombo,
  isFlashDeal,
  isTrending,
}: IPagination) => {
  // search based on (name , brand ,basegory ,proId)
  const filter: any = {}
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matchingCategories = await Category.find({
      name: { $regex: safeSearch, $options: 'i' },
    }).select('_id')

    const categoryIds = matchingCategories.map((c) => c._id)
    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { brand: { $regex: safeSearch, $options: 'i' } },

      { productID: { $regex: safeSearch, $options: 'i' } },
      { category: { $in: categoryIds } },
    ]
  }
 

  const sortOptions: any = {}

  if (sort) {
    const nameOfSort = sort.startsWith('-') ? sort.slice(1) : sort
    const sortOrder = sort.startsWith('-') ? -1 : 1
    sortOptions[nameOfSort] = sortOrder
  }

  // filter by offerce product
  if (isFlashDeal == 'true') {
    filter.isFlashDeal = true
  }
  if (isCombo == 'true') {
    filter.isCombo = true
  }
  if (isTrending == 'true') {
    filter.isTrending = true
  }

  // pagination
  const skip = (page - 1) * limit
  const total_product = await Product.countDocuments(filter)

  // product find
  const products = await Product.find(filter)
    .select(select || '')

    .skip(skip)
    .limit(limit)
    .sort(sortOptions)
    .populate('category')
  if (products.length === 0) {
    throw new Error('No products found')
  }

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
