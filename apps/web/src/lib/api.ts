// Client-side API utilities for Next.js API routes
import { apiLogger } from './logger'

// Import types for use in this file
import { SystemOverview, CpuMetrics, MemoryMetrics, DockerContainer } from './types'

// Re-export types from centralized types file
export * from './types'

// Next.js API client for internal API routes
async function apiRequest<T>(endpoint: string): Promise<T> {
  const url = `/api${endpoint}`
  
  apiLogger.debug(`Request: ${url}`)
  const startTime = performance.now()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    if (!response.ok) {
      const errorText = await response.text()
      const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      apiLogger.error(`Request failed: ${url}`, error.message)
      throw error
    }

    const result = await response.json()
    
    apiLogger.debug(`Response: ${response.status} (${responseTime}ms)`)
    
    if (!result.success) {
      const error = new Error(`API request failed: ${result.error || 'Unknown error'}`)
      apiLogger.error(`API error: ${url}`, error.message)
      throw error
    }

    return result.data
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    if (error instanceof Error) {
      apiLogger.error(`Request failed after ${responseTime}ms: ${url}`, error.message)
    }
    throw error
  }
}

// API client functions
export const apiClient = {
  getSystemOverview: () => apiRequest<SystemOverview>('/system/overview'),
  getCpuMetrics: () => apiRequest<CpuMetrics>('/system/cpu'),
  getMemoryMetrics: () => apiRequest<MemoryMetrics>('/system/memory'),
  getDockerContainers: () => apiRequest<DockerContainer[]>('/docker/containers'),
  getHealth: () => apiRequest<{ status: string; uptime: number; timestamp: string; version: string; environment?: string }>('/health')
}

// SWR fetcher function - simplified for Next.js API routes
export const fetcher = async (url: string) => {
  apiLogger.debug(`SWR fetcher: ${url}`)
  return apiRequest(url.replace('/api', ''))
}

// Debug utility to inspect API client state
export const debugApiClient = () => {
  apiLogger.info('API Client Debug Info', {
    environment: process.env.NODE_ENV,
    clientSide: typeof window !== 'undefined'
  })
}