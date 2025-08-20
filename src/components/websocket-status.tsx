'use client'

import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { WebSocketStatus } from "@/lib/websocket-client"
import { 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  AlertTriangle,
  Loader2
} from "lucide-react"

interface WebSocketStatusProps {
  status: WebSocketStatus
  lastUpdate: string | null
  error: string | null
  onReconnect?: () => void
}

export function WebSocketStatusIndicator({ 
  status, 
  lastUpdate, 
  error, 
  onReconnect 
}: WebSocketStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          label: 'Connected',
          variant: 'success' as const,
          className: 'text-green-600 border-green-200 bg-green-50'
        }
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: 'Connecting',
          variant: 'outline' as const,
          className: 'text-blue-600 border-blue-200 bg-blue-50'
        }
      case 'reconnecting':
        return {
          icon: <RotateCcw className="h-4 w-4 animate-spin" />,
          label: 'Reconnecting',
          variant: 'warning' as const,
          className: 'text-orange-600 border-orange-200 bg-orange-50'
        }
      case 'error':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: 'Error',
          variant: 'destructive' as const,
          className: 'text-red-600 border-red-200 bg-red-50'
        }
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          label: 'Disconnected',
          variant: 'secondary' as const,
          className: 'text-gray-600 border-gray-200 bg-gray-50'
        }
    }
  }

  const statusInfo = getStatusInfo()

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never'
    
    const updateTime = new Date(lastUpdate)
    const now = new Date()
    const diffMs = now.getTime() - updateTime.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}m ago`
    } else {
      return updateTime.toLocaleTimeString()
    }
  }

  return (
    <Card className={`${statusInfo.className} transition-all duration-200`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <div className="flex flex-col">
              <Badge variant={statusInfo.variant} className="w-fit">
                {statusInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                Last update: {formatLastUpdate()}
              </span>
            </div>
          </div>
          
          {status === 'error' && onReconnect && (
            <button
              onClick={onReconnect}
              className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50 transition-colors"
              title="Retry connection"
            >
              Retry
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface WebSocketStatusBarProps {
  status: WebSocketStatus
  lastUpdate: string | null
  error: string | null
  onReconnect?: () => void
}

export function WebSocketStatusBar({ 
  status, 
  lastUpdate, 
  error, 
  onReconnect 
}: WebSocketStatusBarProps) {
  const statusInfo = getStatusInfo(status)

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'No data received'
    
    const updateTime = new Date(lastUpdate)
    const now = new Date()
    const diffMs = now.getTime() - updateTime.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 5) return 'Just now'
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return updateTime.toLocaleTimeString()
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border
        ${statusInfo.className} transition-all duration-200
      `}>
        {statusInfo.icon}
        <span className="text-sm font-medium">{statusInfo.label}</span>
        <span className="text-xs opacity-75">•</span>
        <span className="text-xs">{formatLastUpdate()}</span>
        
        {status === 'error' && onReconnect && (
          <button
            onClick={onReconnect}
            className="ml-2 text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50 transition-colors"
            title="Retry connection"
          >
            Retry
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 shadow-lg max-w-xs">
          {error}
        </div>
      )}
    </div>
  )
}

function getStatusInfo(status: WebSocketStatus) {
  switch (status) {
    case 'connected':
      return {
        icon: <Wifi className="h-4 w-4" />,
        label: 'Live',
        className: 'text-green-600 border-green-200 bg-green-50'
      }
    case 'connecting':
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: 'Connecting',
        className: 'text-blue-600 border-blue-200 bg-blue-50'
      }
    case 'reconnecting':
      return {
        icon: <RotateCcw className="h-4 w-4 animate-spin" />,
        label: 'Reconnecting',
        className: 'text-orange-600 border-orange-200 bg-orange-50'
      }
    case 'error':
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Error',
        className: 'text-red-600 border-red-200 bg-red-50'
      }
    case 'disconnected':
    default:
      return {
        icon: <WifiOff className="h-4 w-4" />,
        label: 'Offline',
        className: 'text-gray-600 border-gray-200 bg-gray-50'
      }
  }
}