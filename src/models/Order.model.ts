import mongoose, { Schema, model } from 'mongoose'
import { OrderStatus } from '../types/order.type'

/* =============================== order item schema ================================ */

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { _id: false },
)

/* =============================== shipping schema ================================ */

const shippingAddressSchema = new Schema(
  {
    name: String,
    phone: String,
    address: String,
    city: String,
  },
  { _id: false },
)

/* =============================== order schema ================================ */

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: shippingAddressSchema,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
export default Order
