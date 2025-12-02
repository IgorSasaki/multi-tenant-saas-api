import { Role } from '@prisma/client'

import { MembershipEntity } from '@/domain/entities/membership.entity'
import {
  CompanyNotFoundError,
  InsufficientPermissionsError
} from '@/domain/errors/company.errors'
import {
  CannotChangeOwnRoleError,
  MembershipNotFoundError
} from '@/domain/errors/membership.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export interface UpdateMemberRoleDTO {
  membershipId: string
  newRole: Role
  requesterId: string
}

export class UpdateMemberRoleUseCase {
  constructor(
    private membershipRepository: MembershipRepository,
    private companyRepository: CompanyRepository
  ) {}

  async execute(data: UpdateMemberRoleDTO): Promise<MembershipEntity> {
    const { membershipId, newRole, requesterId } = data

    const membership = await this.membershipRepository.findById(membershipId)
    if (!membership) {
      throw new MembershipNotFoundError(membershipId)
    }

    const company = await this.companyRepository.findById(membership.companyId)
    if (!company) {
      throw new CompanyNotFoundError(membership.companyId)
    }

    if (membership.userId === requesterId) {
      throw new CannotChangeOwnRoleError()
    }

    const requesterRole = await this.companyRepository.getUserRoleInCompany(
      requesterId,
      membership.companyId
    )

    if (!requesterRole || requesterRole === Role.MEMBER) {
      throw new InsufficientPermissionsError('update member role')
    }

    if (
      requesterRole === Role.ADMIN &&
      (membership.role === Role.OWNER || newRole === Role.OWNER)
    ) {
      throw new InsufficientPermissionsError('change owner role')
    }

    const updatedMembership = await this.membershipRepository.updateRole(
      membershipId,
      newRole
    )

    return updatedMembership
  }
}
