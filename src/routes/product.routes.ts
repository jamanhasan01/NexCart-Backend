import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
} from '../controllers/product.controller'
import { upload } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()
/* =============================== product routes ================================ */
router.post('/products', upload.array('files', 5), createProduct)
router.get('/products', getAllProduct)
router.get('/products/:id', getSingleProduct)
router.delete('/products/:id', deleteProduct)
router.patch('/products/:id', upload.none(), updateProduct)
export default router
