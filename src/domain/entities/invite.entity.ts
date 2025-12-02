import { Role } from '@prisma/client'

export interface InviteEntity {
  companyId: string
  createdAt: Date
  email: string
  expiresAt: Date
  id: string
  role: Role
  token: string
  updatedAt: Date
  used: boolean
  usedAt: Date | null
}

export interface InviteWithCompany extends InviteEntity {
  company: {
    id: string
    name: string
    logoUrl: string | null
  }
}

export type CreateInviteDTO = {
  email: string
  role: Role
}

export type AcceptInviteDTO = {
  token: string
  name?: string
  password?: string
  userId?: string
}

export interface PaginatedInvites {
  invites: InviteWithCompany[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
