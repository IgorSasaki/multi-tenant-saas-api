import {
  InviteExpiredError,
  InviteNotFoundError
} from '@/domain/errors/invite.errors'
import { InviteRepository } from '@/repositories/invite.repository'

export class GetInviteByTokenUseCase {
  constructor(private inviteRepository: InviteRepository) {}

  async execute(token: string) {
    const invite = await this.inviteRepository.findByToken(token)

    if (!invite) {
      throw new InviteNotFoundError(token)
    }

    if (invite.usedAt) {
      throw new InviteExpiredError()
    }

    if (new Date() > invite.expiresAt) {
      throw new InviteExpiredError()
    }

    return invite
  }
}
