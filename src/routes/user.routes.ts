import { Router } from 'express'
import { getAllUser, getSingleUser } from '../controllers/user.controller'
import { verifyAdmin, verifyToken } from '../middlewares/auth.middleware'

const router = Router()
router.get('/users', verifyToken, getAllUser)
router.get('/users/:id', getSingleUser)

export default router
