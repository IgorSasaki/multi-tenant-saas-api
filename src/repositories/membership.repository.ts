import { Role } from '@prisma/client'

import { prisma } from '@/config/prisma'
import {
  MembershipEntity,
  MembershipWithUser
} from '@/domain/entities/membership.entity'

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

  async findById(id: string): Promise<MembershipEntity | null> {
    return await prisma.membership.findUnique({
      where: { id }
    })
  }

  async findByIdWithUser(id: string): Promise<MembershipWithUser | null> {
    return await prisma.membership.findUnique({
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true
          }
        }
      },
      where: { id }
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

  async findMembersByCompany(
    companyId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ members: MembershipWithUser[]; total: number }> {
    const skip = (page - 1) * pageSize

    const [members, total] = await Promise.all([
      prisma.membership.findMany({
        include: {
          user: {
            select: {
              email: true,
              id: true,
              name: true
            }
          }
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: pageSize,
        where: { companyId }
      }),
      prisma.membership.count({
        where: { companyId }
      })
    ])

    return { members, total }
  }

  async updateRole(id: string, role: Role): Promise<MembershipEntity> {
    return await prisma.membership.update({
      data: { role },
      where: { id }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.membership.delete({
      where: { id }
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

  async existsByUserAndCompany(
    userId: string,
    companyId: string
  ): Promise<boolean> {
    const count = await prisma.membership.count({
      where: {
        companyId,
        userId
      }
    })
    return count > 0
  }
}
