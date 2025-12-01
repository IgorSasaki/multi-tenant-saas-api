import { Request, Response } from 'express'

import { env } from '@/config/env'
import { AuthenticateUserUseCase } from '@/use-cases/user/authenticate-user.use-case'
import { CreateUserUseCase } from '@/use-cases/user/create-user.use-case'
import { JWTUtil } from '@/utils/jwt.util'

export class AuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUserUseCase
  ) {}

  async signup(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body

      const user = await this.createUserUseCase.execute({
        email,
        name,
        password
      })

      // Generate JWT
      const token = JWTUtil.sign({
        email: user.email,
        sub: user.id
      })

      // Set httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
        secure: env.nodeEnv === 'production'
      })

      return res.status(201).json({ token, user })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      const user = await this.authenticateUserUseCase.execute({
        email,
        password
      })

      // Generate JWT
      const token = JWTUtil.sign({
        email: user.email,
        sub: user.id
      })

      // Set httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict',
        secure: env.nodeEnv === 'production'
      })

      return res.status(200).json({ token, user })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('token')
    return res.status(200).json({ message: 'Logged out successfully' })
  }

  async me(req: Request, res: Response) {
    return res.status(200).json(req.user)
  }
}
