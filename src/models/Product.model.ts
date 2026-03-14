import mongoose from 'mongoose'
import { IProduct } from '../types/product.type'

/* =============================== Image Sub Schema ================================ */
const imageSchema = new mongoose.Schema(
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
  { _id: false },
)

/* =============================== Product Schema ================================ */
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
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    brand: {
      type: String,
      default: null,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
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
      required: true,
      min: 0,
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
      enum: ['active', 'inactive', 'draft', 'archived'],
      default: 'draft',
      index: true,
    },
  },

  {
    timestamps: true,
  },
)

/* =============================== Search Index ================================ */

productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
})

/* =============================== Model ================================ */

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
