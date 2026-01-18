import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest, JWTPayload } from '../types/auth.type'

/* =============================== VERIFY TOKEN ================================ */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ success: false, message: 'Login required' })
  }

  const secret = process.env.JSON_TOKEN_SECRET
  if (!secret) {
    return res.status(500).json({
      message: 'JWT secret not configured',
    })
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload
    req.user = decoded
    return next() // ✅ ONLY path forward
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

/* =============================== Verify admin Token ================================ */
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
  }
  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access only',
    })
  }
  next()
}
