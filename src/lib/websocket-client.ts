// WebSocket client for real-time monitoring data from Pi backend
import { config } from './config'
import { WebSocketMessage } from './types'
import { wsLogger } from './logger'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

export interface WebSocketClientOptions {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onMessage?: (message: WebSocketMessage) => void
  onStatusChange?: (status: WebSocketStatus, error?: Error) => void
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private shouldReconnect = true

  constructor(private options: WebSocketClientOptions) {}

  // Connect to WebSocket
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    this.setStatus('connecting')
    this.shouldReconnect = true

    try {
      this.ws = new WebSocket(this.options.url)
      this.setupEventHandlers()
    } catch (error) {
      this.setStatus('error', error as Error)
      this.scheduleReconnect()
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    this.shouldReconnect = false
    this.clearReconnectTimeout()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }

    this.setStatus('disconnected')
  }

  // Get current connection status
  getStatus(): WebSocketStatus {
    return this.status
  }

  // Check if connected
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  // Send message (for future use if needed)
  send(data: unknown): boolean {
    if (!this.isConnected()) {
      wsLogger.warn('WebSocket not connected, cannot send message')
      return false
    }

    try {
      this.ws!.send(JSON.stringify(data))
      return true
    } catch (error) {
      wsLogger.error('WebSocket send error:', error)
      return false
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      wsLogger.info('WebSocket connected to:', this.options.url)
      this.reconnectAttempts = 0
      this.setStatus('connected')
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        
        wsLogger.debug('WebSocket message:', message.type)

        if (this.options.onMessage) {
          this.options.onMessage(message)
        }
      } catch (error) {
        wsLogger.error('WebSocket message parse error:', error)
      }
    }

    this.ws.onclose = (event) => {
      wsLogger.info('WebSocket closed:', event.code, event.reason)
      
      this.ws = null
      
      if (this.shouldReconnect && event.code !== 1000) {
        this.setStatus('disconnected')
        this.scheduleReconnect()
      } else {
        this.setStatus('disconnected')
      }
    }

    this.ws.onerror = (error) => {
      wsLogger.error('WebSocket error:', error)
      this.setStatus('error', new Error('WebSocket connection error'))
    }
  }

  private setStatus(status: WebSocketStatus, error?: Error): void {
    if (this.status === status) return
    
    this.status = status
    
    wsLogger.debug(`WebSocket status: ${status}`)

    if (this.options.onStatusChange) {
      this.options.onStatusChange(status, error)
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return

    const maxAttempts = this.options.maxReconnectAttempts ?? config.websocket.maxReconnectAttempts
    
    if (this.reconnectAttempts >= maxAttempts) {
      wsLogger.error('WebSocket max reconnection attempts reached')
      this.setStatus('error', new Error('Max reconnection attempts reached'))
      return
    }

    this.clearReconnectTimeout()
    this.reconnectAttempts++

    // Exponential backoff: 1s, 2s, 4s, 8s, then cap at reconnectInterval
    const baseDelay = this.options.reconnectInterval ?? config.websocket.reconnectInterval
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts - 1), baseDelay * 4)

    wsLogger.info(`WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`)

    this.setStatus('reconnecting')
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }
}

// Singleton WebSocket client instance
let wsClient: WebSocketClient | null = null

// Factory function to create/get WebSocket client
export function createWebSocketClient(options?: Partial<WebSocketClientOptions>): WebSocketClient {
  if (wsClient) {
    wsClient.disconnect() // Clean up existing connection
  }

  const clientOptions: WebSocketClientOptions = {
    url: config.websocket.url,
    reconnectInterval: config.websocket.reconnectInterval,
    maxReconnectAttempts: config.websocket.maxReconnectAttempts,
    ...options
  }

  wsClient = new WebSocketClient(clientOptions)
  return wsClient
}

// Get the current WebSocket client instance
export function getWebSocketClient(): WebSocketClient | null {
  return wsClient
}

// Utility hook for React components (to be used with SWR or other state management)
export interface UseWebSocketOptions {
  enabled?: boolean
  onMessage?: (message: WebSocketMessage) => void
  onStatusChange?: (status: WebSocketStatus, error?: Error) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true, onMessage, onStatusChange } = options

  // This would typically be implemented as a React hook
  // For now, providing the basic structure
  if (typeof window === 'undefined') {
    // Server-side, return disabled state
    return {
      status: 'disconnected' as WebSocketStatus,
      connect: () => {},
      disconnect: () => {},
      isConnected: false
    }
  }

  if (!wsClient && enabled) {
    wsClient = createWebSocketClient({ onMessage, onStatusChange })
    wsClient.connect()
  }

  return {
    status: wsClient?.getStatus() ?? 'disconnected',
    connect: () => wsClient?.connect(),
    disconnect: () => wsClient?.disconnect(),
    isConnected: wsClient?.isConnected() ?? false
  }
}

// Clean up function for app shutdown
export function cleanupWebSocket(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}