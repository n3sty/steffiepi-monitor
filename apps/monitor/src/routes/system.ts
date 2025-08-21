import type { FastifyInstance } from 'fastify'
import { createApiResponse } from '@steffiepi/shared'
import { SystemService } from '../services/system.js'
import { logger } from '../utils/logger.js'

const systemService = new SystemService()

export async function systemRoutes(fastify: FastifyInstance) {
  // System overview endpoint
  fastify.get('/overview', async (request, reply) => {
    try {
      const overview = await systemService.getOverview()
      reply.send(createApiResponse(overview))
    } catch (error) {
      logger.error(error, 'Failed to get system overview')
      reply.status(500).send(createApiResponse(
        { message: 'Failed to retrieve system overview' },
        false
      ))
    }
  })

  // CPU metrics endpoint
  fastify.get('/cpu', async (request, reply) => {
    try {
      const cpu = await systemService.getCpuMetrics()
      reply.send(createApiResponse(cpu))
    } catch (error) {
      logger.error(error, 'Failed to get CPU metrics')
      reply.status(500).send(createApiResponse(
        { message: 'Failed to retrieve CPU metrics' },
        false
      ))
    }
  })

  // Memory metrics endpoint
  fastify.get('/memory', async (request, reply) => {
    try {
      const memory = await systemService.getMemoryMetrics()
      reply.send(createApiResponse(memory))
    } catch (error) {
      logger.error(error, 'Failed to get memory metrics')
      reply.status(500).send(createApiResponse(
        { message: 'Failed to retrieve memory metrics' },
        false
      ))
    }
  })
}