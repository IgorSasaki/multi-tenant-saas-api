import { Request, Response } from 'express'

import { ListCompanyMembersUseCase } from '@/use-cases/membership/list-company-members.use-case'
import { RemoveMemberUseCase } from '@/use-cases/membership/remove-member.use-case'
import { UpdateMemberRoleUseCase } from '@/use-cases/membership/update-member-role.use-case'

export class MembershipController {
  constructor(
    private listCompanyMembersUseCase: ListCompanyMembersUseCase,
    private updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    private removeMemberUseCase: RemoveMemberUseCase
  ) {}

  async listMembers(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { companyId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' })
      }

      const authenticatedUserId = userId as string

      const result = await this.listCompanyMembersUseCase.execute({
        companyId,
        page,
        pageSize,
        userId: authenticatedUserId
      })

      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'UserNotMemberOfCompanyError' ? 403 : 400
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { membershipId } = req.params
      const { role } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!membershipId) {
        return res.status(400).json({ message: 'Membership ID is required' })
      }

      const authenticatedUserId = userId as string

      const membership = await this.updateMemberRoleUseCase.execute({
        membershipId,
        newRole: role,
        requesterId: authenticatedUserId
      })

      return res.status(200).json(membership)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'InsufficientPermissionsError' ? 403 : 400
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { membershipId } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!membershipId) {
        return res.status(400).json({ message: 'Membership ID is required' })
      }

      const authenticatedUserId = userId as string

      await this.removeMemberUseCase.execute({
        membershipId,
        requesterId: authenticatedUserId
      })

      return res.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'InsufficientPermissionsError' ? 403 : 400
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
