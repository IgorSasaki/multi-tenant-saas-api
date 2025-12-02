import { PaginatedMembers } from '@/domain/entities/membership.entity'
import {
  CompanyNotFoundError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export interface ListCompanyMembersDTO {
  companyId: string
  page?: number
  pageSize?: number
  userId: string
}

export class ListCompanyMembersUseCase {
  constructor(
    private membershipRepository: MembershipRepository,
    private companyRepository: CompanyRepository
  ) {}

  async execute(data: ListCompanyMembersDTO): Promise<PaginatedMembers> {
    const { companyId, page = 1, pageSize = 10, userId } = data

    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    const userMembership = await this.membershipRepository.findByUserAndCompany(
      userId,
      companyId
    )
    if (!userMembership) {
      throw new UserNotMemberOfCompanyError(userId, companyId)
    }

    const { members, total } =
      await this.membershipRepository.findMembersByCompany(
        companyId,
        page,
        pageSize
      )

    const totalPages = Math.ceil(total / pageSize)

    return {
      members,
      page,
      pageSize,
      total,
      totalPages
    }
  }
}
