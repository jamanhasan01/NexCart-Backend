/* =============================== category routes ================================ */

import { Router } from 'express'
import {
  createProductCategory,
  getAllCategories,
  updateProductCategory,
  deleteProductCategory,
} from '../controllers/category.controller'
import { createUploader } from '../middlewares/upload.middleware'
import { authorizeRoles, verifyToken } from '../middlewares/auth.middleware'
const { upload, optimizeImage } = createUploader('category')

const router = Router()

/* =============================== create category ================================ */
router.post('/categories', upload.none(),verifyToken, authorizeRoles('admin', 'super_admin'), createProductCategory)

/* =============================== get all categories ================================ */
router.get('/categories', getAllCategories)

/* =============================== update category ================================ */
router.patch('/categories/:id', upload.none(),verifyToken, authorizeRoles('admin', 'super_admin'), updateProductCategory)

/* =============================== delete category ================================ */
router.delete('/categories/:id',verifyToken, authorizeRoles('admin', 'super_admin'), deleteProductCategory)

export default router
