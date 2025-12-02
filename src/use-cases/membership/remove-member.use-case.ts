import { Role } from '@prisma/client'

import {
  CompanyNotFoundError,
  InsufficientPermissionsError
} from '@/domain/errors/company.errors'
import {
  CannotRemoveLastOwnerError,
  CannotRemoveSelfError,
  MembershipNotFoundError
} from '@/domain/errors/membership.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export interface RemoveMemberDTO {
  membershipId: string
  requesterId: string
}

export class RemoveMemberUseCase {
  constructor(
    private membershipRepository: MembershipRepository,
    private companyRepository: CompanyRepository
  ) {}

  async execute(data: RemoveMemberDTO): Promise<void> {
    const { membershipId, requesterId } = data

    const membership = await this.membershipRepository.findById(membershipId)
    if (!membership) {
      throw new MembershipNotFoundError(membershipId)
    }

    const company = await this.companyRepository.findById(membership.companyId)
    if (!company) {
      throw new CompanyNotFoundError(membership.companyId)
    }

    if (membership.userId === requesterId) {
      throw new CannotRemoveSelfError()
    }

    const requesterRole = await this.companyRepository.getUserRoleInCompany(
      requesterId,
      membership.companyId
    )

    if (!requesterRole || requesterRole === Role.MEMBER) {
      throw new InsufficientPermissionsError('remove member')
    }

    if (requesterRole === Role.ADMIN && membership.role === Role.OWNER) {
      throw new InsufficientPermissionsError('remove owner')
    }

    if (membership.role === Role.OWNER) {
      const ownerCount = await this.membershipRepository.countOwnersByCompany(
        membership.companyId
      )
      if (ownerCount <= 1) {
        throw new CannotRemoveLastOwnerError()
      }
    }

    await this.membershipRepository.delete(membershipId)
  }
}
