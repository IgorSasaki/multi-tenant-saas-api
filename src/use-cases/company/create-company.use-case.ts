import { Role } from '@prisma/client'

import {
  CompanyEntity,
  CreateCompanyDTO
} from '@/domain/entities/company.entity'
import { CompanyNameRequiredError } from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { UserRepository } from '@/repositories/user.repository'

export class CreateCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    data: CreateCompanyDTO,
    userId: string
  ): Promise<CompanyEntity> {
    if (!data.name || data.name.trim().length === 0) {
      throw new CompanyNameRequiredError()
    }

    // Create company
    const company = await this.companyRepository.create(data)

    // Create membership as OWNER
    await this.membershipRepository.create(userId, company.id, Role.OWNER)

    // Set as active company if user doesn't have one
    const user = await this.userRepository.findById(userId)
    if (user && !user.activeCompanyId) {
      await this.userRepository.updateActiveCompany(userId, company.id)
    }

    return company
  }
}
