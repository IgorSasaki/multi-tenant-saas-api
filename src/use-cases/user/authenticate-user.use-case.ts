import bcrypt from 'bcryptjs'

import { UserResponseDTO } from '@/domain/entities/user.entity'
import { InvalidCredentialsError } from '@/domain/errors/user.errors'
import { UserRepository } from '@/repositories/user.repository'

export interface AuthenticateUserDTO {
  email: string
  password: string
}

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: AuthenticateUserDTO): Promise<UserResponseDTO> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    )
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    // Return without password
    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
