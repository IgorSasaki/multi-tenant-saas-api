import { NextFunction, Request, Response } from 'express'

import { UserRepository } from '@/repositories/user.repository'
import { JWTUtil } from '@/utils/jwt.util'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' })
    }

    // Verify token
    const payload = JWTUtil.verify(token)

    // Get user from database
    const userRepository = new UserRepository()
    const user = await userRepository.findById(payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Attach user to request (without password)
    const { passwordHash: _, ...userWithoutPassword } = user
    req.user = userWithoutPassword

    return next()
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ message: error.message })
    }
    return res.status(401).json({ message: 'Invalid authentication token' })
  }
}
