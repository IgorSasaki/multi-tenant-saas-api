import { Router } from 'express'

import { InviteController } from '@/controllers/invite.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CompanyRepository } from '@/repositories/company.repository'
import { InviteRepository } from '@/repositories/invite.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { UserRepository } from '@/repositories/user.repository'
import { AcceptInviteUseCase } from '@/use-cases/invite/accept-invite.use-case'
import { CancelInviteUseCase } from '@/use-cases/invite/cancel-invite.use-case'
import { CreateInviteUseCase } from '@/use-cases/invite/create-invite.use-case'
import { ListCompanyInvitesUseCase } from '@/use-cases/invite/list-company-invites.use-case'

const inviteRoutes = Router()

const inviteRepository = new InviteRepository()
const companyRepository = new CompanyRepository()
const membershipRepository = new MembershipRepository()
const userRepository = new UserRepository()

const createInviteUseCase = new CreateInviteUseCase(
  inviteRepository,
  companyRepository,
  membershipRepository
)
const acceptInviteUseCase = new AcceptInviteUseCase(
  inviteRepository,
  membershipRepository,
  userRepository,
  companyRepository
)
const listCompanyInvitesUseCase = new ListCompanyInvitesUseCase(
  inviteRepository,
  companyRepository,
  membershipRepository
)
const cancelInviteUseCase = new CancelInviteUseCase(
  inviteRepository,
  companyRepository,
  membershipRepository
)

const inviteController = new InviteController(
  createInviteUseCase,
  acceptInviteUseCase,
  listCompanyInvitesUseCase,
  cancelInviteUseCase
)

// Protected routes (require auth)
inviteRoutes.post('/company/:companyId/invite', authMiddleware, (req, res) =>
  inviteController.create(req, res)
)
inviteRoutes.get('/company/:companyId/invites', authMiddleware, (req, res) =>
  inviteController.list(req, res)
)
inviteRoutes.delete(
  '/company/:companyId/invite/:token',
  authMiddleware,
  (req, res) => inviteController.cancel(req, res)
)

// Public route (no auth required)
inviteRoutes.post('/invite/:token/accept', (req, res) =>
  inviteController.accept(req, res)
)

export { inviteRoutes }
