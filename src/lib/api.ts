// Client-side API utilities for Next.js API routes
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

// Debug logger for development
const debugLog = {
  request: (method: string, url: string) => {
    if (!IS_DEVELOPMENT) return
    console.group(`🌐 Next.js API Request: ${method} ${url}`)
    console.log('📤 URL:', url)
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.groupEnd()
  },
  
  response: (url: string, status: number, data?: unknown, responseTime?: number) => {
    if (!IS_DEVELOPMENT) return
    const statusColor = status >= 200 && status < 300 ? '✅' : '❌'
    console.group(`${statusColor} Next.js API Response: ${status} ${url}`)
    console.log('📈 Status:', status)
    console.log('📦 Data:', data)
    if (responseTime) {
      console.log('⚡ Response Time:', `${responseTime}ms`)
    }
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.groupEnd()
  },
  
  error: (url: string, error: Error, responseTime?: number) => {
    if (!IS_DEVELOPMENT) return
    console.group(`💥 Next.js API Error: ${url}`)
    console.error('🚫 Error:', error.message)
    console.error('📊 Stack:', error.stack)
    if (responseTime) {
      console.log('⚡ Failed after:', `${responseTime}ms`)
    }
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.groupEnd()
  },
  
  fetcher: (key: string) => {
    if (!IS_DEVELOPMENT) return
    console.log(`🔄 SWR Fetcher: ${key}`)
  }
}

// Import types for use in this file
import { SystemOverview, CpuMetrics, MemoryMetrics, DockerContainer } from './types'

// Re-export types from centralized types file
export * from './types'

// Next.js API client for internal API routes
async function apiRequest<T>(endpoint: string): Promise<T> {
  const url = `/api${endpoint}`
  
  // Debug: Log request details
  debugLog.request('GET', url)
  
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
      // Debug: Log HTTP error response
      const errorText = await response.text()
      const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      debugLog.error(url, error, responseTime)
      throw error
    }

    const result = await response.json()
    
    // Debug: Log successful response
    debugLog.response(url, response.status, result, responseTime)
    
    if (!result.success) {
      const error = new Error(`API request failed: ${result.error || 'Unknown error'}`)
      debugLog.error(url, error, responseTime)
      throw error
    }

    return result.data
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    if (error instanceof Error) {
      // Debug: Log fetch/network errors
      debugLog.error(url, error, responseTime)
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
  // Debug: Log SWR fetcher calls
  debugLog.fetcher(url)
  
  // Direct fetch to Next.js API routes
  return apiRequest(url.replace('/api', ''))
}

// Debug utility to inspect API client state
export const debugApiClient = () => {
  if (!IS_DEVELOPMENT) return
  
  console.group('🔧 Next.js API Client Debug Info')
  console.log('🌐 Using Next.js API Routes')
  console.log('🏗️ Environment:', process.env.NODE_ENV)
  console.log('🌍 Client-side:', typeof window !== 'undefined')
  console.groupEnd()
}