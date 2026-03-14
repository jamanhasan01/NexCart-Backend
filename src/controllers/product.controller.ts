import fs from 'fs'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import {
  createProductService,
  getAllProductsService,
  getProductStatsService,
  getSingleProductService,
  updatProductService,
} from '../services/product.service'

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
      isDeleted,
    } = req.body

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

    const query = {
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
      isDeleted,
    }
    const product = await createProductService(query)
    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[]

      const uploadedImages = files.map((file) => {
        return `/uploads/products/${file.filename}`
      })

      await Product.findByIdAndUpdate(product._id, {
        images: uploadedImages,
        thumbnail: uploadedImages[0],
      })
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
    const query = req.query

    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const search = (query.search as string) || ''
    const categories = (query.categories as string) || ''
    const productId = (query.productId as string) || ''
    const sort = (query.sort as string) || ''
    const minPrice = (query.minPrice as string) || ''
    const maxPrice = (query.maxPrice as string) || ''
    const status = (query.status as string) || ''
    const isCombo = (query.isCombo as string) || ''
    const isFlashDeal = (query.isFlashDeal as string) || ''
    const isTrending = (query.isTrending as string) || ''

    const select = query.select ? (query.select as string).split(',').join(' ') : ''
    /* =============================== Soft Delete ================================ */

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
      status,
      isCombo,
      isFlashDeal,
      isTrending,
    })

    if (page > result.pagination.total_page) {
      return res.status(400).json({
        success: false,
        message: 'Page number exceeds total pages',
      })
    }

    return res.status(200).json({
      success: true,
      data: result,
    })
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
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'product not found',
      })
    }
    await Product.findByIdAndDelete(id)
    /* =============================== DELETE IMAGES ================================ */

    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath: string) => {
        const fullPath = path.join(process.cwd(), imagePath)

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
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
      status,
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
      ...(status && { status }),
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

/* =============================== get product stats ================================ */

export const getProductStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getProductStatsService()

    res.status(200).json({
      success: true,
      message: 'Product stats retrieved successfully',
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}
