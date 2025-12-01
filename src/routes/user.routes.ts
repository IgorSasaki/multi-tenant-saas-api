import { Router } from 'express'

import { UserController } from '@/controllers/user.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { UserRepository } from '@/repositories/user.repository'
import { CreateUserUseCase } from '@/use-cases/user/create-user.use-case'
import { GetUserProfileUseCase } from '@/use-cases/user/get-user-profile.use-case'

const userRoutes = Router()

// Dependency injection
const userRepository = new UserRepository()
const createUserUseCase = new CreateUserUseCase(userRepository)
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository)
const userController = new UserController(
  createUserUseCase,
  getUserProfileUseCase
)

// Routes
userRoutes.post('/users', (req, res) => userController.create(req, res))
userRoutes.get('/users/me', authMiddleware, (req, res) =>
  userController.getProfile(req, res)
)

export { userRoutes }
