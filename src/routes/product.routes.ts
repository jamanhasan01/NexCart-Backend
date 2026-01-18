import { Router } from 'express'
import { createProduct, getAllProduct, getSingleProduct } from '../controllers/product.controller'
import { upload } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()
/* =============================== product routes ================================ */
router.post('/products', upload.array('files', 5), createProduct)
router.get('/products', verifyToken, getAllProduct)
router.get('/products/:id', getSingleProduct)

export default router
