import type { FastifyInstance } from 'fastify'
import type { HealthStatus } from '@steffiepi/shared'
import { createApiResponse } from '@steffiepi/shared'
import { DockerService } from '../services/docker.js'

const dockerService = new DockerService()

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const startTime = process.hrtime()
    const dockerAvailable = await dockerService.isDockerAvailable()
    const [seconds, nanoseconds] = process.hrtime(startTime)
    const responseTime = seconds * 1000 + nanoseconds / 1000000

    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        system: true,
        docker: dockerAvailable,
        cache: true
      }
    }

    reply
      .header('X-Response-Time', `${responseTime.toFixed(2)}ms`)
      .send(createApiResponse(health))
  })
}