/* =============================== category routes ================================ */

import { Router } from 'express'
import {
  createProductCategory,
  getAllCategories,
  updateProductCategory,
  deleteProductCategory,
} from '../controllers/category.controller'
import { createUploader } from '../middlewares/upload.middleware'
const { upload, optimizeImage } = createUploader('category')

const router = Router()

/* =============================== create category ================================ */
router.post('/categories', upload.none(), createProductCategory)

/* =============================== get all categories ================================ */
router.get('/categories', getAllCategories)

/* =============================== update category ================================ */
router.patch('/categories/:id', upload.none(), updateProductCategory)

/* =============================== delete category ================================ */
router.delete('/categories/:id', deleteProductCategory)

export default router
