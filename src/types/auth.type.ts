import { Request } from 'express'

/* =============================== jwt payload ================================ */
export interface JWTPayload {
  userId: string
  role: 'admin' | 'super_admin' | 'customer'
}

/* =============================== extend express request ================================ */

export interface AuthRequest extends Request {
  user?: JWTPayload
}
