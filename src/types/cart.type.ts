/* =============================== types ================================ */
import { Document, Types } from 'mongoose'

export interface ICartItem {
  product: Types.ObjectId
  quantity: number
  price: number
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
}
