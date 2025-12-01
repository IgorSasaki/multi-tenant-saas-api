import { Request, Response } from 'express'

import { CreateUserUseCase } from '@/use-cases/user/create-user.use-case'
import { GetUserProfileUseCase } from '@/use-cases/user/get-user-profile.use-case'

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body

      const user = await this.createUserUseCase.execute({
        email,
        name,
        password
      })

      return res.status(201).json(user)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const user = await this.getUserProfileUseCase.execute(userId)

      return res.status(200).json(user)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
