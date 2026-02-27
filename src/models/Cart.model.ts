/* =============================== models/cart.model.js ================================ */
import mongoose from 'mongoose'
import { ICart } from '../types/cart.type'

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number, // store price snapshot
      required: true,
    },
  },
  { _id: false },
)

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true },
)
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
export default Cart
