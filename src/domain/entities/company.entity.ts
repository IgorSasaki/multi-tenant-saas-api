import { Role } from '@prisma/client'

export interface CompanyEntity {
  createdAt: Date
  id: string
  logoUrl: string | null
  name: string
  updatedAt: Date
}

export interface CompanyWithMembers extends CompanyEntity {
  memberships: Array<{
    id: string
    role: Role
    userId: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export interface CompanyWithUserRole extends CompanyEntity {
  userRole: Role
}

export type CreateCompanyDTO = {
  name: string
  logoUrl?: string | null
}

export type UpdateCompanyDTO = Partial<CreateCompanyDTO>

export interface PaginatedCompanies {
  companies: CompanyWithUserRole[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
