import { Request, Response } from 'express'

import { env } from '@/config/env'
import { AcceptInviteUseCase } from '@/use-cases/invite/accept-invite.use-case'
import { CancelInviteUseCase } from '@/use-cases/invite/cancel-invite.use-case'
import { CreateInviteUseCase } from '@/use-cases/invite/create-invite.use-case'
import { ListCompanyInvitesUseCase } from '@/use-cases/invite/list-company-invites.use-case'
import { JWTUtil } from '@/utils/jwt.util'

export class InviteController {
  constructor(
    private createInviteUseCase: CreateInviteUseCase,
    private acceptInviteUseCase: AcceptInviteUseCase,
    private listCompanyInvitesUseCase: ListCompanyInvitesUseCase,
    private cancelInviteUseCase: CancelInviteUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { companyId } = req.params
      const { email, role } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const invite = await this.createInviteUseCase.execute({
        companyId,
        email,
        requesterId: userId,
        role
      })

      return res.status(201).json({
        createdAt: invite.createdAt,
        email: invite.email,
        expiresAt: invite.expiresAt,
        id: invite.id,
        role: invite.role,
        token: invite.token
      })
    } catch (error) {
      if (error instanceof Error) {
        const status = error.name === 'InsufficientPermissionsError' ? 403 : 400
        return res.status(status).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { token } = req.params
      const { name, password } = req.body

      const result = await this.acceptInviteUseCase.execute({
        name,
        password,
        token,
        userId: userId || undefined
      })

      if (!userId) {
        const tokenJWT = JWTUtil.sign({
          email: result.user.email,
          sub: result.user.id
        })

        res.cookie('token', tokenJWT, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'strict',
          secure: env.nodeEnv === 'production'
        })

        return res.status(200).json({
          ...result,
          token: tokenJWT
        })
      }

      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { companyId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const result = await this.listCompanyInvitesUseCase.execute({
        companyId,
        page,
        pageSize,
        userId
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

  async cancel(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { companyId, token } = req.params

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      await this.cancelInviteUseCase.execute({
        companyId,
        requesterId: userId,
        token
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
