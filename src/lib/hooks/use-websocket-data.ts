'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createWebSocketClient, WebSocketStatus } from '../websocket-client'
import { WebSocketMessage, SystemOverview, DockerContainer } from '../types'
import { wsLogger } from '../logger'

interface WebSocketData {
  system: SystemOverview | null
  docker: DockerContainer[] | null
  lastUpdate: string | null
}

interface UseWebSocketDataReturn {
  data: WebSocketData
  status: WebSocketStatus
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  error: string | null
}

export function useWebSocketData(): UseWebSocketDataReturn {
  const [data, setData] = useState<WebSocketData>({
    system: null,
    docker: null,
    lastUpdate: null
  })
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const wsClientRef = useRef<ReturnType<typeof createWebSocketClient> | null>(null)

  const handleMessage = useCallback((message: WebSocketMessage) => {
    wsLogger.debug('WebSocket message received:', message.type)
    
    if (message.type === 'metrics_update' && message.data) {
      setData(prevData => ({
        system: message.data.system || prevData.system,
        docker: message.data.docker || prevData.docker,
        lastUpdate: message.timestamp
      }))
      setError(null)
    } else if (message.type === 'error') {
      setError(message.data.error || 'WebSocket error occurred')
    }
  }, [])

  const handleStatusChange = useCallback((newStatus: WebSocketStatus, wsError?: Error) => {
    setStatus(newStatus)
    
    if (wsError) {
      setError(wsError.message)
      wsLogger.error('WebSocket status change error:', wsError)
    } else if (newStatus === 'connected') {
      setError(null)
    }
  }, [])

  const connect = useCallback(() => {
    if (wsClientRef.current?.isConnected()) {
      return
    }

    try {
      wsClientRef.current = createWebSocketClient({
        onMessage: handleMessage,
        onStatusChange: handleStatusChange
      })
      wsClientRef.current.connect()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create WebSocket connection'
      setError(errorMsg)
      wsLogger.error('Failed to connect WebSocket:', err)
    }
  }, [handleMessage, handleStatusChange])

  const disconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      wsClientRef.current = null
    }
    setStatus('disconnected')
    setError(null)
  }, [])

  // Auto-connect on mount, disconnect on unmount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Reconnect when status changes to error (with delay)
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        wsLogger.info('Attempting to reconnect after error...')
        connect()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [status, connect])

  return {
    data,
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    error
  }
}