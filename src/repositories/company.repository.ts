import { Role } from '@prisma/client'

import { prisma } from '@/config/prisma'
import {
  CompanyEntity,
  CompanyWithMembers,
  CompanyWithUserRole,
  CreateCompanyDTO,
  UpdateCompanyDTO
} from '@/domain/entities/company.entity'

export class CompanyRepository {
  async findById(id: string): Promise<CompanyEntity | null> {
    return await prisma.company.findUnique({
      where: { id }
    })
  }

  async findByIdWithMembers(id: string): Promise<CompanyWithMembers | null> {
    return await prisma.company.findUnique({
      include: {
        memberships: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
                name: true
              }
            }
          }
        }
      },
      where: { id }
    })
  }

  async findCompaniesByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ companies: CompanyWithUserRole[]; total: number }> {
    const skip = (page - 1) * pageSize

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
        include: {
          company: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize,
        where: { userId }
      }),
      prisma.membership.count({
        where: { userId }
      })
    ])

    const companies = memberships.map(membership => ({
      ...membership.company,
      userRole: membership.role
    }))

    return { companies, total }
  }

  async create(data: CreateCompanyDTO): Promise<CompanyEntity> {
    return await prisma.company.create({
      data: {
        logoUrl: data.logoUrl || null,
        name: data.name
      }
    })
  }

  async update(id: string, data: UpdateCompanyDTO): Promise<CompanyEntity> {
    return await prisma.company.update({
      data,
      where: { id }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id }
    })
  }

  async getUserRoleInCompany(
    userId: string,
    companyId: string
  ): Promise<Role | null> {
    const membership = await prisma.membership.findUnique({
      select: {
        role: true
      },
      where: {
        userId_companyId: {
          companyId,
          userId
        }
      }
    })

    return membership?.role || null
  }
}
