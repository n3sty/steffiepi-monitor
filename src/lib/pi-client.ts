// HTTP client for communicating with node-monitor Pi backend
import { config, validateConfig } from './config'
import { SystemOverview, CpuMetrics, MemoryMetrics, NetworkMetrics, DockerContainer, ContainerStats, HealthStatus } from './types'
import { piLogger } from './logger'

// Ensure configuration is valid
validateConfig()

export class PiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'PiClientError'
  }
}

// Retry configuration
interface RetryConfig {
  attempts: number
  delay: number
  backoff: number
}

const defaultRetryConfig: RetryConfig = {
  attempts: config.api.retries,
  delay: 1000, // 1 second
  backoff: 2, // Exponential backoff multiplier
}

// Sleep utility for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// HTTP client with retry logic and proper error handling
class PiClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseUrl = config.api.url
    this.apiKey = config.api.key
    this.timeout = config.api.timeout
  }

  private async makeRequest<T>(
    endpoint: string,
    retryConfig = defaultRetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      try {
        if (config.isDevelopment) {
          piLogger.debug(`Request [${attempt}/${retryConfig.attempts}]: ${endpoint}`)
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new PiClientError(
            `HTTP ${response.status}: ${errorText}`,
            response.status,
            endpoint
          )
        }

        const result = await response.json()

        piLogger.debug(`Response: ${endpoint}`)

        if (!result.success) {
          throw new PiClientError(
            `API Error: ${result.error || 'Unknown error'}`,
            undefined,
            endpoint
          )
        }

        return result.data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        piLogger.warn(`Request failed [${attempt}/${retryConfig.attempts}]: ${lastError.message}`)

        // Don't retry on certain errors
        if (error instanceof PiClientError) {
          if (error.statusCode === 401 || error.statusCode === 403) {
            throw error // Authentication/authorization errors
          }
        }

        // If this was the last attempt, throw the error
        if (attempt === retryConfig.attempts) {
          throw lastError
        }

        // Wait before retrying with exponential backoff
        const delay = retryConfig.delay * Math.pow(retryConfig.backoff, attempt - 1)
        await sleep(delay)
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error during Pi request')
  }

  // System monitoring endpoints
  async getSystemOverview(): Promise<SystemOverview> {
    return this.makeRequest<SystemOverview>('/api/system/overview')
  }

  async getCpuMetrics(): Promise<CpuMetrics> {
    return this.makeRequest<CpuMetrics>('/api/system/cpu')
  }

  async getMemoryMetrics(): Promise<MemoryMetrics> {
    return this.makeRequest<MemoryMetrics>('/api/system/memory')
  }

  async getNetworkMetrics(): Promise<NetworkMetrics> {
    return this.makeRequest<NetworkMetrics>('/api/system/network')
  }

  // Docker monitoring endpoints
  async getDockerContainers(): Promise<DockerContainer[]> {
    return this.makeRequest<DockerContainer[]>('/api/docker/containers')
  }

  async getContainerStats(containerId: string): Promise<ContainerStats> {
    return this.makeRequest<ContainerStats>(`/api/docker/containers/${containerId}/stats`)
  }

  async getContainerLogs(
    containerId: string,
    options: { lines?: number; since?: string; until?: string } = {}
  ): Promise<{ logs: Array<{ timestamp: string; stream: string; message: string }>; totalLines: number }> {
    const params = new URLSearchParams()
    if (options.lines) params.set('lines', options.lines.toString())
    if (options.since) params.set('since', options.since)
    if (options.until) params.set('until', options.until)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.makeRequest(`/api/docker/containers/${containerId}/logs${query}`)
  }

  // Health check
  async getHealth(): Promise<HealthStatus> {
    return this.makeRequest('/api/health')
  }

  // Connection test utility
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.getHealth()
      return health.status === 'healthy'
    } catch (error) {
      if (config.isDevelopment) {
        piLogger.error('Connection test failed:', error)
      }
      return false
    }
  }
}

// Singleton instance
export const piClient = new PiClient()

// Export client methods for easy access with proper binding
export const getPiSystemOverview = () => piClient.getSystemOverview()
export const getPiCpuMetrics = () => piClient.getCpuMetrics()
export const getPiMemoryMetrics = () => piClient.getMemoryMetrics()
export const getPiNetworkMetrics = () => piClient.getNetworkMetrics()
export const getPiDockerContainers = () => piClient.getDockerContainers()
export const getPiContainerStats = (containerId: string) => piClient.getContainerStats(containerId)
export const getPiContainerLogs = (containerId: string, options?: { lines?: number; since?: string; until?: string }) => 
  piClient.getContainerLogs(containerId, options)
export const getPiHealth = () => piClient.getHealth()
export const testPiConnection = () => piClient.testConnection()