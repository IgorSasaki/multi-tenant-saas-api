import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import { env } from './config/env.js'
import { authRoutes } from './routes/auth.routes.js'
import { companyRoutes } from './routes/company.routes.js'
import { inviteRoutes } from './routes/invite.routes.js'
import { membershipRoutes } from './routes/membership.routes.js'

export const createApp = () => {
  const app = express()

  app.use(express.json())
  app.use(helmet())
  app.use(cookieParser())
  app.use(cors({ credentials: true, origin: env.corsOrigin }))
  app.use(rateLimit({ max: 100, windowMs: 60_000 }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api', authRoutes)
  app.use('/api', companyRoutes)
  app.use('/api', membershipRoutes)
  app.use('/api', inviteRoutes)

  return app
}
