/* =============================== category routes ================================ */

import { Router } from 'express'
import {
  createProductCategory,
  getAllCategories,
  updateProductCategory,
  deleteProductCategory,
} from '../controllers/category.controller'
import { createUploader } from '../middlewares/upload.middleware'
const productUpload = createUploader("category")

const router = Router()

/* =============================== create category ================================ */
router.post('/categories', productUpload.none(), createProductCategory)

/* =============================== get all categories ================================ */
router.get('/categories', getAllCategories)

/* =============================== update category ================================ */
router.patch('/categories/:id', productUpload.none(), updateProductCategory)

/* =============================== delete category ================================ */
router.delete('/categories/:id', deleteProductCategory)

export default router
