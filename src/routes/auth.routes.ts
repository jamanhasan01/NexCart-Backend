import { Router } from 'express'
import { getMe, loginUser, logoutUser, registerUser } from '../controllers/auth.controller'
import { createUploader } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'
import { updateProfile } from '../controllers/user.controller'
const userUpload = createUploader("users")
const router = Router()

router.post('/register', userUpload.single('file'), registerUser)

router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', verifyToken, getMe)
router.patch('/me', verifyToken, userUpload.single('file'), updateProfile)

export default router
