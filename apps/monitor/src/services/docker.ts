import Docker from 'dockerode'
import type { DockerContainer, ContainerStats } from '@steffiepi/shared'
import { logger } from '../utils/logger.js'

export class DockerService {
  private docker: Docker

  constructor() {
    this.docker = new Docker()
  }

  async getContainers(): Promise<DockerContainer[]> {
    try {
      const containers = await this.docker.listContainers({ all: true })
      
      return containers.map(container => ({
        id: container.Id.substring(0, 12),
        name: container.Names[0]?.replace('/', '') || 'unknown',
        image: container.Image,
        status: container.Status,
        state: container.State,
        ports: container.Ports?.map(port => ({
          privatePort: port.PrivatePort,
          publicPort: port.PublicPort,
          type: port.Type
        })) || [],
        created: new Date(container.Created * 1000).toISOString(),
        started: container.State === 'running' ? new Date().toISOString() : null
      }))
    } catch (error) {
      logger.error('Failed to get Docker containers:', error as Error)
      return []
    }
  }

  async getContainerStats(containerId: string): Promise<ContainerStats | null> {
    try {
      const container = this.docker.getContainer(containerId)
      const stats = await container.stats({ stream: false })

      // Calculate CPU usage percentage
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
      const cpuUsage = (cpuDelta / systemDelta) * 100

      return {
        id: containerId,
        name: (stats as any).name?.replace('/', '') || 'unknown',
        cpu: {
          usage: Math.round(cpuUsage || 0),
          system: Math.round(systemDelta || 0)
        },
        memory: {
          usage: stats.memory_stats.usage || 0,
          limit: stats.memory_stats.limit || 0,
          percentage: Math.round(((stats.memory_stats.usage || 0) / (stats.memory_stats.limit || 1)) * 100)
        },
        network: {
          rx: Object.values(stats.networks || {}).reduce((acc: number, net: any) => acc + (net.rx_bytes || 0), 0),
          tx: Object.values(stats.networks || {}).reduce((acc: number, net: any) => acc + (net.tx_bytes || 0), 0)
        },
        io: {
          read: stats.blkio_stats?.io_service_bytes_recursive?.find((item: any) => item.op === 'Read')?.value || 0,
          write: stats.blkio_stats?.io_service_bytes_recursive?.find((item: any) => item.op === 'Write')?.value || 0
        }
      }
    } catch (error) {
      logger.error(`Failed to get stats for container ${containerId}:`, error as Error)
      return null
    }
  }

  async isDockerAvailable(): Promise<boolean> {
    try {
      await this.docker.ping()
      return true
    } catch {
      return false
    }
  }
}