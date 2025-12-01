import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.url(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_SECRET: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333)
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = {
  corsOrigin: _env.data.CORS_ORIGIN,
  databaseUrl: _env.data.DATABASE_URL,
  jwtExpiresIn: _env.data.JWT_EXPIRES_IN,
  jwtSecret: _env.data.JWT_SECRET,
  nodeEnv: _env.data.NODE_ENV,
  port: _env.data.PORT
}
