import { Types } from 'mongoose'

/* =============================== Product Interface ================================ */
export interface IProduct {
  productID?: string

  name: string
  description: string

  category: Types.ObjectId
  brand?: string | null

  price: number
  discount?: number

  stock: number

  images: string[]

  isTrending: boolean
  isFlashDeal: boolean
  isCombo: boolean

  tags: string[]

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
