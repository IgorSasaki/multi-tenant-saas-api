import { Role } from '@/domain/enums/role.enum'
import {
  CompanyNotFoundError,
  InsufficientPermissionsError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { InviteNotFoundError } from '@/domain/errors/invite.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { InviteRepository } from '@/repositories/invite.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export interface CancelInviteDTO {
  companyId: string
  requesterId: string
  token: string
}

export class CancelInviteUseCase {
  constructor(
    private inviteRepository: InviteRepository,
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository
  ) {}

  async execute(data: CancelInviteDTO): Promise<void> {
    const { companyId, requesterId, token } = data

    // Find invite
    const invite = await this.inviteRepository.findByToken(token)
    if (!invite) {
      throw new InviteNotFoundError(token)
    }

    // Validate company
    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    // Check if invite belongs to company
    if (invite.companyId !== companyId) {
      throw new InviteNotFoundError(token)
    }

    // Check if requester is member
    const membership = await this.membershipRepository.findByUserAndCompany(
      requesterId,
      companyId
    )
    if (!membership) {
      throw new UserNotMemberOfCompanyError(requesterId, companyId)
    }

    // Check permissions
    if (membership.role === Role.MEMBER) {
      throw new InsufficientPermissionsError('cancel invite')
    }

    // Delete invite
    await this.inviteRepository.delete(token)
  }
}
