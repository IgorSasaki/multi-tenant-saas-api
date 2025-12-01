import { PrismaClient } from '@prisma/client'

import { env } from './env.js'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.databaseUrl
      }
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
