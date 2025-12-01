import { createApp } from './app.js'
import { env } from './config/env.js'

const bootstrap = async () => {
  try {
    console.log('🔄 Starting application...')

    // Initialize application
    const app = createApp()
    console.log('✅ Application initialized')

    // Start HTTP server
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`)
      console.log(`📍 Environment: ${env.nodeEnv || 'development'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap().catch(err => {
  console.error('❌ Unhandled error in bootstrap:', err)
  process.exit(1)
})
