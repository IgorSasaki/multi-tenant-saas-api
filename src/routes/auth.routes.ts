import { Router } from 'express'

import { AuthController } from '@/controllers/auth.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { UserRepository } from '@/repositories/user.repository'
import { AuthenticateUserUseCase } from '@/use-cases/user/authenticate-user.use-case'
import { CreateUserUseCase } from '@/use-cases/user/create-user.use-case'

const authRoutes = Router()

// Dependency injection
const userRepository = new UserRepository()
const createUserUseCase = new CreateUserUseCase(userRepository)
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository)
const authController = new AuthController(
  createUserUseCase,
  authenticateUserUseCase
)

// Routes
authRoutes.post('/auth/signup', (req, res) => authController.signup(req, res))
authRoutes.post('/auth/login', (req, res) => authController.login(req, res))
authRoutes.post('/auth/logout', (req, res) => authController.logout(req, res))
authRoutes.get('/auth/me', authMiddleware, (req, res) =>
  authController.me(req, res)
)

export { authRoutes }
