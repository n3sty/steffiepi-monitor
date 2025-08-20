import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { getPiDockerContainers } from '@/lib/pi-client'
import { DockerContainer } from '@/lib/types'
import { apiLogger } from '@/lib/logger'

// Mock Docker containers data for development
async function getMockDockerContainers(): Promise<DockerContainer[]> {
  // Mock Docker containers data
  // In a real implementation, you'd use Docker API or docker CLI commands
  const mockContainers: DockerContainer[] = [
    {
      id: 'abc123def456',
      name: 'nginx-proxy',
      image: 'nginx:alpine',
      status: 'Up 2 hours',
      state: 'running',
      ports: [
        { privatePort: 80, publicPort: 8080, type: 'tcp' },
        { privatePort: 443, publicPort: 8443, type: 'tcp' }
      ],
      created: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      started: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'def456ghi789',
      name: 'redis-cache',
      image: 'redis:7-alpine',
      status: 'Up 1 day',
      state: 'running',
      ports: [
        { privatePort: 6379, type: 'tcp' }
      ],
      created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      started: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'ghi789jkl012',
      name: 'postgres-db',
      image: 'postgres:15',
      status: 'Exited (0) 5 minutes ago',
      state: 'exited',
      ports: [],
      created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      started: null
    }
  ]

  return mockContainers.map(container => ({
    ...container,
    status: container.state === 'running' 
      ? `Up ${Math.floor(Math.random() * 24)} hours`
      : container.status
  }))
}

// Real Docker containers from Pi backend
async function getRealDockerContainers(): Promise<DockerContainer[]> {
  try {
    return await getPiDockerContainers()
  } catch (error) {
    apiLogger.warn('Pi Docker containers failed, using mock data:', error)
    return getMockDockerContainers()
  }
}

export async function GET() {
  const startTime = performance.now()
  
  try {
    apiLogger.debug(`API Proxy [${config.mode}]: GET /api/docker/containers`)

    const data = config.mode === 'real'
      ? await getRealDockerContainers()
      : await getMockDockerContainers()
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    apiLogger.debug(`Docker Containers API [${config.mode}]: ${responseTime}ms`, {
      containerCount: data.length,
      running: data.filter(c => c.state === 'running').length,
      stopped: data.filter(c => c.state === 'exited').length
    })

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    apiLogger.error(`Docker Containers API Error (${responseTime}ms):`, error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}