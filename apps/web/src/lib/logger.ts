type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface LoggerConfig {
  level: LogLevel
  enabled: boolean
  prefix?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
}

class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'warn',
      enabled: process.env.NODE_ENV === 'development' || process.env.LOG_ENABLED === 'true',
      prefix: process.env.LOG_PREFIX || '🔍',
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && LOG_LEVELS[level] <= LOG_LEVELS[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = this.config.prefix || ''
    
    switch (level) {
      case 'error':
        console.error(`${prefix} [ERROR] ${timestamp}: ${message}`, ...args)
        break
      case 'warn':
        console.warn(`${prefix} [WARN] ${timestamp}: ${message}`, ...args)
        break
      case 'info':
        console.info(`${prefix} [INFO] ${timestamp}: ${message}`, ...args)
        break
      case 'debug':
        console.debug(`${prefix} [DEBUG] ${timestamp}: ${message}`, ...args)
        break
      case 'trace':
        console.trace(`${prefix} [TRACE] ${timestamp}: ${message}`, ...args)
        break
    }
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args)
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args)
  }

  trace(message: string, ...args: unknown[]): void {
    this.formatMessage('trace', message, ...args)
  }

  // Convenience methods for specific contexts
  api(message: string, ...args: unknown[]): void {
    this.info(`[API] ${message}`, ...args)
  }

  ws(message: string, ...args: unknown[]): void {
    this.info(`[WS] ${message}`, ...args)
  }

  pi(message: string, ...args: unknown[]): void {
    this.info(`[PI] ${message}`, ...args)
  }

  swr(message: string, ...args: unknown[]): void {
    this.debug(`[SWR] ${message}`, ...args)
  }
}

// Create default logger instance
export const logger = new Logger()

// Create specialized loggers
export const apiLogger = new Logger({ prefix: '🌐', level: 'info' })
export const wsLogger = new Logger({ prefix: '🔌', level: 'warn' })
export const piLogger = new Logger({ prefix: '🍓', level: 'warn' })
export const swrLogger = new Logger({ prefix: '🔄', level: 'debug' })

// Export the Logger class for custom instances
export { Logger }
export type { LogLevel, LoggerConfig }
