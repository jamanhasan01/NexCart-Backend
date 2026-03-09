import { NextFunction, Request, Response } from 'express'
import { getAllUserService, getSingleUserService } from '../services/user.service'
import User from '../models/User.model'

/* =============================== Get All Users Controller ================================ */
export const getAllUser = async (req: Request, res: Response) => {
  try {
    // ================================query params======================================

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const search = req.query.search as string
    const role = req.query.role as string
    const status = req.query.status as string
    // ================================users service called======================================
    const result = await getAllUserService({ page, limit, search, role, status })

    // ================================page validation======================================

    if (page > result.total_pages) {
      return res.status(400).json({ success: false, message: 'Page number exceeds total pages' })
    }
    // ================================Success Response======================================
    return res.status(200).json({
      success: true,
      data: result.users,
      stats: result.stats,
      pagination: {
        page: result.page,
        limit: result.limit,
        total_pages: result.total_pages,
        total_user: result.total_users,
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    })
  }
}

/* =============================== Get Single User Controller ================================ */

export const getSingleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    /* =============================== Check User id provide G in perams or not ================================ */
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    /* =============================== For get single user service ================================ */
    const result = await getSingleUserService(id as string)
    /* =============================== For get single user service ================================ */
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    /* =============================== Success Response ================================ */
    res.status(200).json({ success: true, data: result })
  } catch (error: any) {
    next(error)
  }
}

/* =============================== Delete User Controller ================================ */

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    /* =============================== validation ================================ */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    /* =============================== find user ================================ */

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    /* =============================== prevent admin delete ================================ */

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin users cannot be deleted',
      })
    }

    /* =============================== delete user ================================ */

    await User.findByIdAndDelete(id)

    /* =============================== success response ================================ */

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}


/* =============================== Block / Unblock User Controller ================================ */

export const toggleBlockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      })
    }

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    /* =============================== prevent admin block ================================ */

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot be blocked",
      })
    }

    /* =============================== toggle block ================================ */

    user.isBlocked = !user.isBlocked
    await user.save()

    return res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}