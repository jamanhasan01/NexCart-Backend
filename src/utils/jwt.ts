import { NextFunction } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import { JWTPayload } from '../types/auth.type'

export const generateToken = (payload: JWTPayload) => {
  const secret = process.env.JSON_TOKEN_SECRET
  if (!secret) {
    throw new Error('JWT secret is not found')
  }
  return jwt.sign(payload, secret as Secret, { expiresIn: '1h' })
}
