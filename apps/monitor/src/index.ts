import fastify from 'fastify'
import websocket from '@fastify/websocket'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import dotenv from 'dotenv'
import { systemRoutes } from './routes/system.js'
import { dockerRoutes } from './routes/docker.js'
import { healthRoutes } from './routes/health.js'
import { websocketRoutes } from './routes/websocket.js'
import { logger } from './utils/logger.js'

dotenv.config()

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

const PORT = parseInt(process.env.PORT || '3001')
const HOST = process.env.HOST || '0.0.0.0'

async function start() {
  try {
    // Register plugins
    await server.register(websocket)
    await server.register(cors, {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    })
    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    })

    // Register routes
    await server.register(healthRoutes, { prefix: '/api/health' })
    await server.register(systemRoutes, { prefix: '/api/system' })
    await server.register(dockerRoutes, { prefix: '/api/docker' })
    await server.register(websocketRoutes, { prefix: '/ws' })

    // Start server
    await server.listen({ port: PORT, host: HOST })
    logger.info(`🍓 SteffiePI Monitor Server running on ${HOST}:${PORT}`)
    
  } catch (error) {
    logger.error('Failed to start server:', error as Error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down server...')
  await server.close()
  process.exit(0)
})

start()