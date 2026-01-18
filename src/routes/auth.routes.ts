import { Router } from 'express'
import { getMe, loginUser, logoutUser, registerUser } from '../controllers/auth.controller'
import { upload } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

router.post('/register', upload.single('file'), registerUser)

router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', verifyToken, getMe)

export default router
