export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function createApiResponse<T>(data: T, success: boolean = true): { success: boolean; data?: T; error?: string; timestamp: string } {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : (data as any)?.message || 'Unknown error',
    timestamp: new Date().toISOString()
  }
}

export function isValidPort(port: number): boolean {
  return port >= 1 && port <= 65535
}