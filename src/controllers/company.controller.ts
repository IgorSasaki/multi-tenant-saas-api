import { Request, Response } from 'express'

import { CreateCompanyUseCase } from '@/use-cases/company/create-company.use-case'
import { GetCompanyDetailsUseCase } from '@/use-cases/company/get-company-details.use-case'
import { ListUserCompaniesUseCase } from '@/use-cases/company/list-user-companies.use-case'
import { SelectActiveCompanyUseCase } from '@/use-cases/company/select-active-company.use-case'

export class CompanyController {
  constructor(
    private createCompanyUseCase: CreateCompanyUseCase,
    private listUserCompaniesUseCase: ListUserCompaniesUseCase,
    private selectActiveCompanyUseCase: SelectActiveCompanyUseCase,
    private getCompanyDetailsUseCase: GetCompanyDetailsUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const { logoUrl, name } = req.body

      const company = await this.createCompanyUseCase.execute(
        { logoUrl, name },
        userId
      )

      return res.status(201).json(company)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10

      const result = await this.listUserCompaniesUseCase.execute({
        page,
        pageSize,
        userId
      })

      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async selectActive(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { id: companyId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const user = await this.selectActiveCompanyUseCase.execute(
        userId,
        companyId
      )

      return res.status(200).json(user)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'UserNotMemberOfCompanyError' ? 403 : 400
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { id: companyId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const company = await this.getCompanyDetailsUseCase.execute(
        companyId,
        userId
      )

      return res.status(200).json(company)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'UserNotMemberOfCompanyError' ? 403 : 404
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
