import { Router } from 'express'
import { addToCart, getCart, updateCartItem, removeCartItem } from '../controllers/cart.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

router.post('/cart/add', verifyToken, addToCart)
router.get('/cart', verifyToken, getCart)

router.patch('/cart/update', verifyToken, updateCartItem)
router.delete('/cart/:productId', verifyToken, removeCartItem)

export default router
