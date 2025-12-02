import { Router } from 'express'

import { CompanyController } from '@/controllers/company.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { UserRepository } from '@/repositories/user.repository'
import { CreateCompanyUseCase } from '@/use-cases/company/create-company.use-case'
import { GetCompanyDetailsUseCase } from '@/use-cases/company/get-company-details.use-case'
import { ListUserCompaniesUseCase } from '@/use-cases/company/list-user-companies.use-case'
import { SelectActiveCompanyUseCase } from '@/use-cases/company/select-active-company.use-case'

const companyRoutes = Router()

// Dependency injection
const companyRepository = new CompanyRepository()
const membershipRepository = new MembershipRepository()
const userRepository = new UserRepository()

const createCompanyUseCase = new CreateCompanyUseCase(
  companyRepository,
  membershipRepository,
  userRepository
)
const listUserCompaniesUseCase = new ListUserCompaniesUseCase(companyRepository)
const selectActiveCompanyUseCase = new SelectActiveCompanyUseCase(
  companyRepository,
  membershipRepository,
  userRepository
)
const getCompanyDetailsUseCase = new GetCompanyDetailsUseCase(
  companyRepository,
  membershipRepository
)

const companyController = new CompanyController(
  createCompanyUseCase,
  listUserCompaniesUseCase,
  selectActiveCompanyUseCase,
  getCompanyDetailsUseCase
)

// Routes (todas protegidas por autenticação)
companyRoutes.post('/company', authMiddleware, (req, res) =>
  companyController.create(req, res)
)
companyRoutes.get('/companies', authMiddleware, (req, res) =>
  companyController.list(req, res)
)
companyRoutes.post('/company/:id/select', authMiddleware, (req, res) =>
  companyController.selectActive(req, res)
)
companyRoutes.get('/company/:id', authMiddleware, (req, res) =>
  companyController.getDetails(req, res)
)

export { companyRoutes }
