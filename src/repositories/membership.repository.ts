import { Role } from '@prisma/client'

import { prisma } from '@/config/prisma'

export interface MembershipEntity {
  companyId: string
  createdAt: Date
  id: string
  role: Role
  updatedAt: Date
  userId: string
}

export class MembershipRepository {
  async create(
    userId: string,
    companyId: string,
    role: Role
  ): Promise<MembershipEntity> {
    return await prisma.membership.create({
      data: {
        companyId,
        role,
        userId
      }
    })
  }

  async findByUserAndCompany(
    userId: string,
    companyId: string
  ): Promise<MembershipEntity | null> {
    return await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          companyId,
          userId
        }
      }
    })
  }

  async countOwnersByCompany(companyId: string): Promise<number> {
    return await prisma.membership.count({
      where: {
        companyId,
        role: Role.OWNER
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.membership.delete({
      where: { id }
    })
  }
}
