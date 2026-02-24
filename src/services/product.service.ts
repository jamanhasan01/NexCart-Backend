import Product from '../models/Product.model'
import { IProduct } from '../types/product.type'
import { IPagination } from '../types/query.type'

/* =============================== product create business logic ================================ */
export const createProductService = async (data: IProduct) => {
  return await Product.create({
    ...data,
    images: [],
  })
}

/* =============================== get all product  business logic ================================ */

export const getAllProductsService = async ({ page, limit, select }: IPagination) => {
  const skip = (page - 1) * limit
  const total_product = await Product.countDocuments()
  const products = await Product.find()
    .select(select || '')

    .skip(skip)
    .limit(limit)

  return {
    products,
    total_product,
    page,
    limit,
    total_page: Math.ceil(total_product / limit),
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
