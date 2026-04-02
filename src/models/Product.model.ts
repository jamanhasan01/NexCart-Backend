import mongoose from 'mongoose'
import { IProduct } from '../types/product.type'

/* =============================== Product Schema ================================ */
const productSchema = new mongoose.Schema<IProduct>(
  {
    productID: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },

    brand: {
      type: String,
      default: null,
      index: true,
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be less than 0'],
      max: [100, 'Discount cannot exceed 100%'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    /* =============================== Images ================================ */

    images: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      default: '',
    },

    /* =============================== Inventory ================================ */

    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },

    /* =============================== Product Flags ================================ */

    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFlashDeal: {
      type: Boolean,
      default: false,
      index: true,
    },

    isCombo: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =============================== Tags ================================ */

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    /* =============================== Status ================================ */

    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'draft', 'archived'],
        message: 'Invalid status value',
      },
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

/* =============================== Search Index ================================ */
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
})

/* =============================== Model ================================ */
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product