import { Router } from 'express'
import { getMe, loginUser, logoutUser, registerUser } from '../controllers/auth.controller'
import { createUploader } from '../middlewares/upload.middleware'
import { verifyToken } from '../middlewares/auth.middleware'
import { updateProfile } from '../controllers/user.controller'
const { upload, optimizeImage } = createUploader('users')
const router = Router()

router.post('/register', upload.none(), optimizeImage, registerUser)

router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', verifyToken, getMe)
router.patch('/me', verifyToken, upload.single('file'), optimizeImage, updateProfile)

export default router
