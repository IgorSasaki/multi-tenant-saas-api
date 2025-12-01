import { UserResponseDTO } from '@/domain/entities/user.entity'
import { UserNotFoundError } from '@/domain/errors/user.errors'
import { UserRepository } from '@/repositories/user.repository'

export class UpdateActiveCompanyUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    userId: string,
    companyId: string | null
  ): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    const updatedUser = await this.userRepository.updateActiveCompany(
      userId,
      companyId
    )

    const { passwordHash: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  }
}
