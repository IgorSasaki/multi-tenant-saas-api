import { UserResponseDTO } from '@/domain/entities/user.entity'
import {
  CompanyNotFoundError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { UserRepository } from '@/repositories/user.repository'

export class SelectActiveCompanyUseCase {
  constructor(
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, companyId: string): Promise<UserResponseDTO> {
    // Check if company exists
    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    // Check if user is member of company
    const membership = await this.membershipRepository.findByUserAndCompany(
      userId,
      companyId
    )
    if (!membership) {
      throw new UserNotMemberOfCompanyError(userId, companyId)
    }

    // Update active company
    const updatedUser = await this.userRepository.updateActiveCompany(
      userId,
      companyId
    )

    const { passwordHash: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  }
}
