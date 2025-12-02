import { Router } from 'express'

import { MembershipController } from '@/controllers/membership.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { ListCompanyMembersUseCase } from '@/use-cases/membership/list-company-members.use-case'
import { RemoveMemberUseCase } from '@/use-cases/membership/remove-member.use-case'
import { UpdateMemberRoleUseCase } from '@/use-cases/membership/update-member-role.use-case'

const membershipRoutes = Router()

const membershipRepository = new MembershipRepository()
const companyRepository = new CompanyRepository()

const listCompanyMembersUseCase = new ListCompanyMembersUseCase(
  membershipRepository,
  companyRepository
)
const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(
  membershipRepository,
  companyRepository
)
const removeMemberUseCase = new RemoveMemberUseCase(
  membershipRepository,
  companyRepository
)

const membershipController = new MembershipController(
  listCompanyMembersUseCase,
  updateMemberRoleUseCase,
  removeMemberUseCase
)

membershipRoutes.get(
  '/company/:companyId/members',
  authMiddleware,
  (req, res) => membershipController.listMembers(req, res)
)
membershipRoutes.patch(
  '/membership/:membershipId/role',
  authMiddleware,
  (req, res) => membershipController.updateRole(req, res)
)
membershipRoutes.delete(
  '/membership/:membershipId',
  authMiddleware,
  (req, res) => membershipController.removeMember(req, res)
)

export { membershipRoutes }
