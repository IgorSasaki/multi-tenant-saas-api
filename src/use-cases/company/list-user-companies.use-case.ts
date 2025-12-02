import { PaginatedCompanies } from '@/domain/entities/company.entity'
import { CompanyRepository } from '@/repositories/company.repository'

export interface ListUserCompaniesDTO {
  page?: number
  pageSize?: number
  userId: string
}

export class ListUserCompaniesUseCase {
  constructor(private companyRepository: CompanyRepository) {}

  async execute(data: ListUserCompaniesDTO): Promise<PaginatedCompanies> {
    const page = data.page || 1
    const pageSize = data.pageSize || 10

    const { companies, total } =
      await this.companyRepository.findCompaniesByUserId(
        data.userId,
        page,
        pageSize
      )

    const totalPages = Math.ceil(total / pageSize)

    return {
      companies,
      page,
      pageSize,
      total,
      totalPages
    }
  }
}
