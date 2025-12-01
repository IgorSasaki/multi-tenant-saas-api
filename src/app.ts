import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import { env } from './config/env.js'

export const createApp = () => {
  const app = express()

  app.use(express.json())
  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin }))
  app.use(rateLimit({ max: 100, windowMs: 60_000 }))

  app.get('/', (_req, res) => res.json({ ok: true }))

  return app
}
