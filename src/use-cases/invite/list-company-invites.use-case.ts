import { PaginatedInvites } from '@/domain/entities/invite.entity'
import { Role } from '@/domain/enums/role.enum'
import {
  CompanyNotFoundError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { InviteRepository } from '@/repositories/invite.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export interface ListCompanyInvitesDTO {
  companyId: string
  page?: number
  pageSize?: number
  userId: string
}

export class ListCompanyInvitesUseCase {
  constructor(
    private inviteRepository: InviteRepository,
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository
  ) {}

  async execute(data: ListCompanyInvitesDTO): Promise<PaginatedInvites> {
    const { companyId, page = 1, pageSize = 10, userId } = data

    // Validate company exists
    const company = await this.companyRepository.findById(companyId)
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

    // Check permissions
    if (membership.role === Role.MEMBER) {
      throw new Error('Members cannot view invites')
    }

    const { invites, total } = await this.inviteRepository.findInvitesByCompany(
      companyId,
      page,
      pageSize
    )

    const totalPages = Math.ceil(total / pageSize)

    return {
      invites,
      page,
      pageSize,
      total,
      totalPages
    }
  }
}
