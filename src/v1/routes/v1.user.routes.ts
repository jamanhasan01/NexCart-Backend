import { Router } from 'express'
import {
  deleteUser,
  getAllUser,
  getSingleUser,
  toggleAdminRole,
  toggleBlockUser,
} from '../controllers/v1.user.controller'
import { authorizeRoles, verifyToken } from '../../middlewares/auth.middleware'



const router = Router()

/* =============================== Get All Users ================================ */

router.get('/users', verifyToken, authorizeRoles('admin', 'super_admin'), getAllUser)

/* =============================== Get Single User ================================ */

router.get('/users/:id', verifyToken, authorizeRoles('admin', 'super_admin'), getSingleUser)

/* =============================== Delete User ================================ */

router.delete('/users/:id', verifyToken, authorizeRoles('admin','super_admin'), deleteUser)

/* =============================== Block / Unblock User ================================ */

router.patch(
  '/users/:id/block',
  verifyToken,
  authorizeRoles('admin', 'super_admin'),
  toggleBlockUser,
)

/* =============================== Make / Remove Admin ================================ */

router.patch('/users/:id/role', verifyToken, authorizeRoles('super_admin'), toggleAdminRole)

export default router
