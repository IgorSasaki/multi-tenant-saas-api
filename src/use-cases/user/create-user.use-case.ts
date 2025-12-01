import bcrypt from 'bcryptjs'

import { CreateUserDTO, UserResponseDTO } from '@/domain/entities/user.entity'
import {
  UserAlreadyExistsError,
  WeakPasswordError
} from '@/domain/errors/user.errors'
import { UserRepository } from '@/repositories/user.repository'

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Validate password strength
    if (data.password.length < 8) {
      throw new WeakPasswordError()
    }

    // Check if user already exists
    const userExists = await this.userRepository.existsByEmail(data.email)
    if (userExists) {
      throw new UserAlreadyExistsError(data.email)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await this.userRepository.create({
      ...data,
      passwordHash
    })

    // Return without password
    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
