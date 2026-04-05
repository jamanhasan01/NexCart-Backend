import { Types } from 'mongoose'
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived'
/* =============================== Product Interface ================================ */
export interface IProduct {
  productID?: string

  name: string
  description: string

  category: ICategory
  brand?: string | null

  price: number
  discount?: number
  finalPrice: number
  stock: number

  images: string[]
  thumbnail: string
  isTrending: boolean
  isFlashDeal: boolean
  isCombo: boolean

  tags: string[]
  status: ProductStatus
  createdAt?: Date
  updatedAt?: Date
}

/* =============================== Category Interface ================================ */
export interface ICategory {
  name: string
  slug: string
  icon?: string | null
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/* =============================== update category payload ================================ */

export interface IUpdateCategory {
  name?: string
  icon?: string
}
