import { CompanyWithMembers } from '@/domain/entities/company.entity'
import {
  CompanyNotFoundError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export class GetCompanyDetailsUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository
  ) {}

  async execute(
    companyId: string,
    userId: string
  ): Promise<CompanyWithMembers> {
    // Check if company exists
    const company = await this.companyRepository.findByIdWithMembers(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    // Check if user is member
    const membership = await this.membershipRepository.findByUserAndCompany(
      userId,
      companyId
    )
    if (!membership) {
      throw new UserNotMemberOfCompanyError(userId, companyId)
    }

    return company
  }
}
