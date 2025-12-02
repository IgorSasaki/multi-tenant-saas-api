import { Role } from '@prisma/client'

export interface MembershipEntity {
  companyId: string
  createdAt: Date
  id: string
  role: Role
  updatedAt: Date
  userId: string
}

export interface MembershipWithUser extends MembershipEntity {
  user: {
    id: string
    name: string
    email: string
  }
}

export interface MembershipWithCompany extends MembershipEntity {
  company: {
    id: string
    name: string
    logoUrl: string | null
  }
}

export type UpdateMemberRoleDTO = {
  role: Role
}

export interface PaginatedMembers {
  members: MembershipWithUser[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
