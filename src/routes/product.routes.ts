import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductStats,
  getSingleProduct,
  updateProduct,
} from '../controllers/product.controller'
import { createUploader } from '../middlewares/upload.middleware'
import { authorizeRoles, verifyToken } from '../middlewares/auth.middleware'

const { upload, optimizeImage } = createUploader('products')
const router = Router()
/* =============================== product routes ================================ */
router.post('/products',verifyToken, authorizeRoles('admin', 'super_admin'), upload.array('files', 5), optimizeImage, createProduct)
router.get('/products', getAllProduct)
router.get('/products/stats', getProductStats)
router.get('/products/:id', getSingleProduct)
router.delete('/products/:id',verifyToken, authorizeRoles('admin', 'super_admin'), deleteProduct)
router.patch('/products/:id',verifyToken, authorizeRoles('admin', 'super_admin'), upload.array('files', 5), optimizeImage, updateProduct)

export default router
