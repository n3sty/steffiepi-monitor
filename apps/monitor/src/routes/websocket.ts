import type { FastifyInstance } from 'fastify'
import type { WebSocketMessage } from '@steffiepi/shared'
import { SystemService } from '../services/system.js'
import { DockerService } from '../services/docker.js'
import { logger } from '../utils/logger.js'

const systemService = new SystemService()
const dockerService = new DockerService()

export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/metrics', { websocket: true }, (connection, request) => {
    logger.info('New WebSocket connection established')
    
    // Send initial connection status
    const connectionMessage: WebSocketMessage = {
      type: 'connection_status',
      timestamp: new Date().toISOString(),
      data: {
        status: 'connected'
      }
    }
    connection.socket.send(JSON.stringify(connectionMessage))

    // Set up periodic metrics updates
    const interval = setInterval(async () => {
      try {
        const [systemOverview, containers] = await Promise.all([
          systemService.getOverview(),
          dockerService.getContainers()
        ])

        const message: WebSocketMessage = {
          type: 'metrics_update',
          timestamp: new Date().toISOString(),
          data: {
            system: systemOverview,
            docker: containers
          }
        }

        connection.socket.send(JSON.stringify(message))
      } catch (error) {
        logger.error('Error sending WebSocket metrics update:', error)
        
        const errorMessage: WebSocketMessage = {
          type: 'error',
          timestamp: new Date().toISOString(),
          data: {
            error: 'Failed to retrieve metrics'
          }
        }
        
        connection.socket.send(JSON.stringify(errorMessage))
      }
    }, 5000) // Send updates every 5 seconds

    // Handle connection close
    connection.socket.on('close', () => {
      logger.info('WebSocket connection closed')
      clearInterval(interval)
    })

    // Handle connection errors
    connection.socket.on('error', (error: Error) => {
      logger.error('WebSocket error:', error)
      clearInterval(interval)
    })
  })
}