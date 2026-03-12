import Category from '../models/Category.model'
import { ICategory, IUpdateCategory } from '../types/product.type'

/* ===============================  create products category business logic ================================ */
export const createProductCategoryService = async (categories: ICategory[]) => {
  const names = categories.map((c) => c.name)

  const existing = await Category.exists({ name: { $in: names } })
  if (!!existing) {
    throw new Error('One or more categories already exist')
  }
  // 🔥 generate slug manually (REQUIRED for insertMany)
  const payload = categories.map((c) => ({
    ...c,
    slug: c.name.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
  }))
  const result = await Category.insertMany(payload)
  return result
}


/* =============================== update product category business logic ================================ */
export const updateProductCategoryService = async (id: string, payload: IUpdateCategory) => {
  const updateData: Partial<IUpdateCategory & { slug?: string }> = { ...payload }

  // regenerate slug if name changes
  if (payload.name) {
    updateData.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  const result = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })

  if (!result) {
    const err: any = new Error('Category not found')
    err.statusCode = 404
    throw err
  }

  return result
}

/* =============================== delete product category business logic ================================ */
export const deleteProductCategoryService = async (id: string) => {
  const result = await Category.findByIdAndDelete(id)

  if (!result) {
    throw new Error('Category not found')
  }

  return result
}
