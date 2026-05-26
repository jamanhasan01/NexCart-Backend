import { Router } from 'express'
import { getMe, loginUser, logoutUser, registerUser } from '../controllers/auth.controller'

import { verifyToken } from '../middlewares/auth.middleware'
import { updateProfile } from '../controllers/user.controller'
import upload from '../middlewares/multer.middleware'

const router = Router()

router.post('/register', upload.none(), registerUser)

router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/me', verifyToken, getMe)
router.patch('/me', verifyToken, upload.single('file'), updateProfile)

export default router
