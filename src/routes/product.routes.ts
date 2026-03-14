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

const productUpload = createUploader("products")
const router = Router()
/* =============================== product routes ================================ */
router.post('/products', productUpload.array('files', 5), createProduct)
router.get('/products', getAllProduct)
router.get('/products/stats', getProductStats)
router.get('/products/:id', getSingleProduct)
router.delete('/products/:id', deleteProduct)
router.patch('/products/:id', productUpload.none(), updateProduct)

export default router
