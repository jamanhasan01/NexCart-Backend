import { NextFunction, Request, Response } from 'express'
import { loginUserService, registerUserService } from '../services/auth.service'
import { generateToken } from '../utils/jwt'
import { singleImageUploadService } from '../services/image.upload.service'
import User from '../models/User.model'
import { AuthRequest } from '../types/auth.type'

/* =============================== resgister controller ================================ */
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = await req.body

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      })
    }

    const user = await registerUserService(name, email, password, phone)
    res.status(201).json({
      success: true,
      message: 'user registerd successfully',
      data: user,
    })
    if (req.file) {
      singleImageUploadService(req.file, user._id.toString())
    }
  } catch (error: any) {
    next(error)
  }
}

/* =============================== Login controller ================================ */

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    /* =============================== validation ================================ */

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    /* =============================== find user ================================ */

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    /* =============================== blocked check ================================ */

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      })
    }

    /* =============================== login service ================================ */

    const result = await loginUserService(email, password)

    /* =============================== generate token ================================ */

    const token = generateToken({
      userId: result.userExists._id.toString(),
      role: result.userExists.role,
    })

    /* =============================== set cookie ================================ */

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    /* =============================== success response ================================ */

    res.status(200).json({
      success: true,
      message: 'Login successfully',
    })
  } catch (error) {
    next(error)
  }
}
/* =============================== me controller (current login user data) ================================ */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId

  if (!userId) {
    return res.status(404).json({ status: false, message: 'Unauthorized' })
  }
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }
    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}
/* =============================== logout ================================ */
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}
