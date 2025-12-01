import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

const bootstrap = async () => {
  try {
    console.log('🔄 Starting application...')

    console.log('🔄 Testing database connection...')
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')

    const app = createApp()
    console.log('✅ Application initialized')

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`)
      console.log(`📍 Environment: ${env.nodeEnv || 'development'}`)
      console.log(`🗄️  Database: Connected`)
    })

    const gracefulShutdown = (signal: string) => {
      console.log(`\n⚠️  ${signal} received, closing server gracefully...`)

      server.close(() => {
        console.log('🔄 HTTP server closed')

        prisma
          .$disconnect()
          .then(() => {
            console.log('✅ Database disconnected')
            process.exit(0)
          })
          .catch(error => {
            console.error('❌ Error disconnecting database:', error)
            process.exit(1)
          })
      })

      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
  } catch (error) {
    console.error('❌ Failed to start application:', error)

    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    await prisma.$disconnect()
    process.exit(1)
  }
}

bootstrap().catch(err => {
  console.error('❌ Unhandled error in bootstrap:', err)
  prisma
    .$disconnect()
    .then(() => process.exit(1))
    .catch(() => process.exit(1))
})
