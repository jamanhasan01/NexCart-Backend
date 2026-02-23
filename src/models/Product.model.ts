import mongoose from 'mongoose'
import { IProduct } from '../types/product.type'

/* =============================== Complete Product Schema ================================ */
const productSchema = new mongoose.Schema<IProduct>(
  {
    productID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    brand: {
      type: String,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    description: {
      type: String,
      required: true,
    },

    /* =============================== Product Schema ================================ */

    images: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isFlashDeal: {
      type: Boolean,
      default: false,
    },

    isCombo: {
      type: Boolean,
      default: false,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

/* =============================== Model Export ================================ */
const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
