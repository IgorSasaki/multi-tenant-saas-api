import dotenv from 'dotenv'
dotenv.config()

export const env = {
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3333',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3333
}
