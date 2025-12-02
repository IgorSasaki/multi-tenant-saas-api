import { prisma } from '@/config/prisma'
import {
  CreateInviteDTO,
  InviteEntity,
  InviteWithCompany
} from '@/domain/entities/invite.entity'

export class InviteRepository {
  async create(
    data: CreateInviteDTO & { companyId: string; token: string }
  ): Promise<InviteEntity> {
    return await prisma.invite.create({
      data: {
        companyId: data.companyId,
        email: data.email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        role: data.role,
        token: data.token,
        used: false
      }
    })
  }

  async findByToken(token: string): Promise<InviteEntity | null> {
    return await prisma.invite.findUnique({
      where: { token }
    })
  }

  async findByTokenWithCompany(
    token: string
  ): Promise<InviteWithCompany | null> {
    return await prisma.invite.findUnique({
      include: {
        company: {
          select: {
            id: true,
            logoUrl: true,
            name: true
          }
        }
      },
      where: { token }
    })
  }

  async findInvitesByCompany(
    companyId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ invites: InviteWithCompany[]; total: number }> {
    const skip = (page - 1) * pageSize

    const [invites, total] = await Promise.all([
      prisma.invite.findMany({
        include: {
          company: {
            select: {
              id: true,
              logoUrl: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize,
        where: { companyId }
      }),
      prisma.invite.count({
        where: { companyId }
      })
    ])

    return { invites, total }
  }

  async markAsUsed(token: string): Promise<InviteEntity> {
    return await prisma.invite.update({
      data: {
        used: true,
        usedAt: new Date()
      },
      where: { token }
    })
  }

  async delete(token: string): Promise<void> {
    await prisma.invite.delete({
      where: { token }
    })
  }

  async existsByEmailAndCompany(
    email: string,
    companyId: string
  ): Promise<boolean> {
    const count = await prisma.invite.count({
      where: {
        companyId,
        email,
        expiresAt: {
          gt: new Date()
        },
        used: false
      }
    })
    return count > 0
  }
}
