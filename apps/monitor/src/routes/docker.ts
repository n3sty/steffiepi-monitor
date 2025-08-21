import type { FastifyInstance } from 'fastify'
import { createApiResponse } from '@steffiepi/shared'
import { DockerService } from '../services/docker.js'
import { logger } from '../utils/logger.js'

const dockerService = new DockerService()

export async function dockerRoutes(fastify: FastifyInstance) {
  // List all containers
  fastify.get('/containers', async (request, reply) => {
    try {
      const containers = await dockerService.getContainers()
      reply.send(createApiResponse(containers))
    } catch (error) {
      logger.error('Failed to get Docker containers:', error as Error)
      reply.status(500).send(createApiResponse(
        { message: 'Failed to retrieve Docker containers' },
        false
      ))
    }
  })

  // Get container stats
  fastify.get('/containers/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    try {
      const stats = await dockerService.getContainerStats(id)
      if (!stats) {
        reply.status(404).send(createApiResponse(
          { message: 'Container not found or stats unavailable' },
          false
        ))
        return
      }
      
      reply.send(createApiResponse(stats))
    } catch (error) {
      logger.error(`Failed to get stats for container ${id}:`, error as Error)
      reply.status(500).send(createApiResponse(
        { message: 'Failed to retrieve container stats' },
        false
      ))
    }
  })
}