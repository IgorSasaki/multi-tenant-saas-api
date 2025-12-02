import { randomUUID } from 'crypto'

import { Role } from '@prisma/client'

import { CreateInviteDTO, InviteEntity } from '@/domain/entities/invite.entity'
import {
  CompanyNotFoundError,
  InsufficientPermissionsError,
  UserNotMemberOfCompanyError
} from '@/domain/errors/company.errors'
import { CompanyRepository } from '@/repositories/company.repository'
import { InviteRepository } from '@/repositories/invite.repository'
import { MembershipRepository } from '@/repositories/membership.repository'

export class CreateInviteUseCase {
  constructor(
    private inviteRepository: InviteRepository,
    private companyRepository: CompanyRepository,
    private membershipRepository: MembershipRepository
  ) {}

  async execute(
    data: CreateInviteDTO & { companyId: string; requesterId: string }
  ): Promise<InviteEntity> {
    const { companyId, email, requesterId, role } = data

    // Validate company exists
    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    // Check if requester is member of company
    const requesterMembership =
      await this.membershipRepository.findByUserAndCompany(
        requesterId,
        companyId
      )
    if (!requesterMembership) {
      throw new UserNotMemberOfCompanyError(requesterId, companyId)
    }

    // Check permissions
    if (requesterMembership.role === Role.MEMBER) {
      throw new InsufficientPermissionsError('create invite')
    }

    if (requesterMembership.role === Role.ADMIN && role === Role.OWNER) {
      throw new InsufficientPermissionsError('invite as owner')
    }

    // Check if invite already exists for this email
    const existingInvite = await this.inviteRepository.existsByEmailAndCompany(
      email,
      companyId
    )
    if (existingInvite) {
      throw new Error('An active invite already exists for this email')
    }

    // Generate unique token
    const token = `invite-${randomUUID()}-${Date.now()}`

    // Create invite
    const invite = await this.inviteRepository.create({
      companyId,
      email,
      role,
      token
    })

    return invite
  }
}
