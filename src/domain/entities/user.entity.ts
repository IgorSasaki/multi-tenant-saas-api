import { Role } from '@prisma/client'

export interface UserEntity {
  activeCompanyId: string | null
  createdAt: Date
  email: string
  id: string
  name: string
  passwordHash: string
  updatedAt: Date
}

export interface UserWithMemberships extends UserEntity {
  memberships: Array<{
    id: string
    companyId: string
    role: Role
    company: {
      id: string
      name: string
      logoUrl: string | null
    }
  }>
}

export type CreateUserDTO = {
  name: string
  email: string
  password: string
}

export type UserResponseDTO = Omit<UserEntity, 'passwordHash'>
