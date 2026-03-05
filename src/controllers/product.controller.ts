import { NextFunction, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import {
  createProductService,
  getAllProductsService,
  getSingleProductService,
  updatProductService,
} from '../services/product.service'
import { multipleImageUploadService } from '../services/image.upload.service'
import Product from '../models/Product.model'

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discount,
      stock,
      isTrending,
      isFlashDeal,
      isCombo,
      tags,
      status,
    } = req.body
console.log(req.body);

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      })
    }

    const productID = `PRD-${nanoid(8).toUpperCase()}`

    /* =============================== FIXED TAG PARSING ================================ */
    let parsedTags: string[] = []

    if (Array.isArray(tags)) {
      parsedTags = tags
    } else if (typeof tags === 'string' && tags.length > 0) {
      parsedTags = [tags]
    }

    const product = await createProductService({
      productID,
      name,
      description,
      category,
      brand,
      price: Number(price),
      discount: discount ? Number(discount) : 0,
      stock: Number(stock),
      isTrending,
      isFlashDeal,
      isCombo,
      tags: parsedTags,
      images: [],
      thumbnail: '',
      status,
    })

    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[]
      await multipleImageUploadService(files, product._id.toString())
    }

    res.status(201).json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}
/* =============================== get all products controller ================================ */
export const getAllProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const search = (req.query.search as string) || ''
    const categories = (req.query.categories as string) || ''
    const productId = (req.query.productId as string) || ''
    const sort = (req.query.sort as string) || ''
    const minPrice = (req.query.minPrice as string) || ''
    const maxPrice = (req.query.maxPrice as string) || ''
    const select = req.query.select ? (req.query.select as string).split(',').join(' ') : ''
    const isCombo = (req.query.isCombo as string) || ''
    const isFlashDeal = (req.query.isFlashDeal as string) || ''
    const isTrending = (req.query.isTrending as string) || ''

    const result = await getAllProductsService({
      page,
      limit,
      select,
      search,
      categories,
      productId,
      sort,
      minPrice,
      maxPrice,
      isCombo,
      isFlashDeal,
      isTrending,
    })
    if (page > result.total_page) {
      res.status(400).json({ success: false, message: 'Page number exceeds total pages' })
    }
    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

/* =============================== get single product  controller ================================ */

export const getSingleProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const result = await getSingleProductService(id as string)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}
/* =============================== delete product  controller ================================ */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'product not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

/* =============================== update product controller ================================ */

/* =============================== helpers ================================ */
const parseBoolean = (value: any) => value === 'true' || value === true

/* =============================== update product controller ================================ */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string }

    /* =============================== Request Body ================================ */
    const {
      name,
      description,
      category,
      brand,
      price,
      discount,
      stock,
      isTrending,
      isFlashDeal,
      isCombo,
      tags,
    } = req.body

    /* =============================== Parse Tags ================================ */
    let parsedTags: string[] | undefined
    if (tags) {
      try {
        parsedTags = JSON.parse(tags)
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format',
        })
      }
    }

    /* =============================== Build Update Payload ================================ */
    const updatePayload: any = {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(brand && { brand }),
      ...(price && { price: Number(price) }),
      ...(discount && { discount: Number(discount) }),
      ...(stock && { stock: Number(stock) }),
      ...(isTrending !== undefined && { isTrending: parseBoolean(isTrending) }),
      ...(isFlashDeal !== undefined && { isFlashDeal: parseBoolean(isFlashDeal) }),
      ...(isCombo !== undefined && { isCombo: parseBoolean(isCombo) }),
      ...(parsedTags && { tags: parsedTags }),
    }

    /* =============================== Update Product ================================ */
    const product = await updatProductService(id, updatePayload)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    // /* =============================== Image Upload ================================ */
    // if (req.files && Array.isArray(req.files)) {
    //   const files = req.files as Express.Multer.File[]
    //   await multipleImageUploadService(files, product._id.toString())
    // }

    /* =============================== Response ================================ */
    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}
