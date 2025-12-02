import bcrypt from 'bcryptjs'

import { AcceptInviteDTO } from '@/domain/entities/invite.entity'
import {
  InviteAlreadyUsedError,
  InviteEmailMismatchError,
  InviteExpiredError,
  InviteNotFoundError,
  UserAlreadyMemberError
} from '@/domain/errors/invite.errors'
import { UserNotFoundError } from '@/domain/errors/user.errors'
import { InviteRepository } from '@/repositories/invite.repository'
import { MembershipRepository } from '@/repositories/membership.repository'
import { UserRepository } from '@/repositories/user.repository'

export class AcceptInviteUseCase {
  constructor(
    private inviteRepository: InviteRepository,
    private membershipRepository: MembershipRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: AcceptInviteDTO): Promise<{
    company: {
      id: string
      logoUrl: string | null
      name: string
    }
    user: {
      id: string
      email: string
      name: string
    }
  }> {
    const { name, password, token, userId } = data

    const invite = await this.inviteRepository.findByTokenWithCompany(token)
    if (!invite) {
      throw new InviteNotFoundError(token)
    }

    if (invite.expiresAt < new Date()) {
      throw new InviteExpiredError()
    }

    if (invite.used) {
      throw new InviteAlreadyUsedError()
    }

    let user

    if (userId) {
      user = await this.userRepository.findById(userId)
      if (!user) {
        throw new UserNotFoundError(userId)
      }

      if (user.email !== invite.email) {
        throw new InviteEmailMismatchError(invite.email, user.email)
      }

      const existingMembership =
        await this.membershipRepository.findByUserAndCompany(
          userId,
          invite.companyId
        )
      if (existingMembership) {
        throw new UserAlreadyMemberError()
      }
    } else {
      if (!name || !password) {
        throw new Error('Name and password are required for new users')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      const existingUser = await this.userRepository.findByEmail(invite.email)
      if (existingUser) {
        throw new Error(
          'User with this email already exists. Please login first.'
        )
      }

      const passwordHash = await bcrypt.hash(password, 10)

      user = await this.userRepository.create({
        email: invite.email,
        name,
        password: passwordHash,
        passwordHash
      })
    }

    await this.membershipRepository.create(
      user.id,
      invite.companyId,
      invite.role
    )

    await this.inviteRepository.markAsUsed(token)

    if (!user.activeCompanyId) {
      await this.userRepository.updateActiveCompany(user.id, invite.companyId)
    }

    const { passwordHash: _, ...userWithoutPassword } = user

    return {
      company: {
        id: invite.company.id,
        logoUrl: invite.company.logoUrl,
        name: invite.company.name
      },
      user: userWithoutPassword
    }
  }
}
