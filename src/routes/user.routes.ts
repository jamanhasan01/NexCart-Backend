import { Router } from 'express'
import { deleteUser, getAllUser, getSingleUser, toggleBlockUser } from '../controllers/user.controller'
import { verifyAdmin, verifyToken } from '../middlewares/auth.middleware'

const router = Router()
router.get('/users', verifyToken,verifyAdmin ,getAllUser)
router.get('/users/:id', getSingleUser)
router.delete('/users/delete/:id', deleteUser)
router.patch('/users/block/:id', toggleBlockUser)

export default router
