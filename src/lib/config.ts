// Configuration management for monitor backend integration

export const config = {
  // Backend API configuration
  api: {
    url: process.env.MONITOR_API_URL || 'https://localhost:3001',
    key: process.env.MONITOR_API_KEY || '',
    timeout: 10000, // 10 seconds
    retries: 3,
  },
  
  // WebSocket configuration
  websocket: {
    url: process.env.MONITOR_WEBSOCKET_URL || 'wss://localhost:3001',
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
  },
  
  // Monitor mode: 'real' for Pi backend, 'mock' for development
  mode: (process.env.MONITOR_MODE || 'mock') as 'real' | 'mock',
  
  // Public client-side mode (for browser usage)
  clientMode: (process.env.NEXT_PUBLIC_MONITOR_MODE || 'mock') as 'real' | 'mock',
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Cache settings
  cache: {
    ttl: 30 * 1000, // 30 seconds
    staleWhileRevalidate: 60 * 1000, // 1 minute
  }
} as const

// Type-safe environment validation
export function validateConfig() {
  const errors: string[] = []
  
  if (config.mode === 'real') {
    if (!config.api.url) {
      errors.push('MONITOR_API_URL is required when MONITOR_MODE=real')
    }
    if (!config.api.key) {
      errors.push('MONITOR_API_KEY is required when MONITOR_MODE=real')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

// Debug configuration info
export function debugConfig() {
  if (!config.isDevelopment) return
  
  console.group('🔧 Monitor Configuration')
  console.log('🎯 Mode:', config.mode)
  console.log('🌐 API URL:', config.api.url)
  console.log('🔑 API Key:', config.api.key ? '***' + config.api.key.slice(-4) : 'Not set')
  console.log('🔌 WebSocket:', config.websocket.url)
  console.log('💻 Client Mode:', config.clientMode)
  console.groupEnd()
}