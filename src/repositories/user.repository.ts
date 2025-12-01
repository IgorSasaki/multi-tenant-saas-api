import { prisma } from '@/config/prisma'
import {
  CreateUserDTO,
  UserEntity,
  UserWithMemberships
} from '@/domain/entities/user.entity'

export class UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  async findByIdWithMemberships(
    id: string
  ): Promise<UserWithMemberships | null> {
    return await prisma.user.findUnique({
      include: {
        memberships: {
          include: {
            company: {
              select: {
                id: true,
                logoUrl: true,
                name: true
              }
            }
          }
        }
      },
      where: { id }
    })
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async create(
    data: CreateUserDTO & { passwordHash: string }
  ): Promise<UserEntity> {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash
      }
    })
  }

  async updateActiveCompany(
    userId: string,
    companyId: string | null
  ): Promise<UserEntity> {
    return await prisma.user.update({
      data: { activeCompanyId: companyId },
      where: { id: userId }
    })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email }
    })
    return count > 0
  }
}
