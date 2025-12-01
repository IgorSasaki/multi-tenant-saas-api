import { UserWithMemberships } from '@/domain/entities/user.entity'
import { UserNotFoundError } from '@/domain/errors/user.errors'
import { UserRepository } from '@/repositories/user.repository'

export class GetUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    userId: string
  ): Promise<Omit<UserWithMemberships, 'passwordHash'>> {
    const user = await this.userRepository.findByIdWithMemberships(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
