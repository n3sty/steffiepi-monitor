'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { logger } from '@/lib/logger'
import { 
  Bug,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  AlertCircle
} from "lucide-react"

interface DebugPanelProps {
  systemData?: unknown
  cpuData?: unknown
  memoryData?: unknown
  dockerData?: unknown
  systemError?: Error | null
  cpuError?: Error
  memoryError?: Error
  dockerError?: Error | null
  systemLoading: boolean
  cpuLoading: boolean
  memoryLoading: boolean
  dockerLoading: boolean
}

export function DebugPanel({
  systemData,
  cpuData,
  memoryData,
  dockerData,
  systemError,
  cpuError,
  memoryError,
  dockerError,
  systemLoading,
  cpuLoading,
  memoryLoading,
  dockerLoading
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const errors = [
    { name: 'System', error: systemError },
    { name: 'CPU', error: cpuError },
    { name: 'Memory', error: memoryError },
    { name: 'Docker', error: dockerError }
  ].filter(({ error }) => error)

  const loadingStates = [
    { name: 'System', loading: systemLoading },
    { name: 'CPU', loading: cpuLoading },
    { name: 'Memory', loading: memoryLoading },
    { name: 'Docker', loading: dockerLoading }
  ].filter(({ loading }) => loading)

  const dataStates = [
    { name: 'System', hasData: !!systemData },
    { name: 'CPU', hasData: !!cpuData },
    { name: 'Memory', hasData: !!memoryData },
    { name: 'Docker', hasData: !!dockerData }
  ]

  const clearConsole = () => {
    console.clear()
    logger.info('Console cleared by Debug Panel')
  }

  const logApiState = () => {
    logger.info('Debug Panel - API State Summary', {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      apiKeySet: !!process.env.NEXT_PUBLIC_API_KEY,
      dataStates,
      activeErrors: errors.length,
      loadingStates: loadingStates.length,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Bug className="h-4 w-4 text-orange-600" />
              Debug Panel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 space-y-3">
            {/* Connection Status */}
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">Connection</div>
              <Badge variant={errors.length === 0 ? "default" : "destructive"} className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                {errors.length === 0 ? 'Connected' : `${errors.length} Errors`}
              </Badge>
            </div>

            {/* Loading States */}
            {loadingStates.length > 0 && (
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">Loading</div>
                <div className="flex flex-wrap gap-1">
                  {loadingStates.map(({ name }) => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Error Details */}
            {errors.length > 0 && (
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">Errors</div>
                <div className="space-y-1">
                  {errors.map(({ name, error }) => (
                    <div key={name} className="text-xs bg-red-50 border border-red-200 rounded p-2">
                      <div className="flex items-center gap-1 font-mono font-medium text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        {name}
                      </div>
                      <div className="text-red-600 mt-1 font-mono text-xs truncate">
                        {error?.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Summary */}
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">Data Status</div>
              <div className="grid grid-cols-2 gap-1">
                {dataStates.map(({ name, hasData }) => (
                  <Badge 
                    key={name} 
                    variant={hasData ? "default" : "outline"} 
                    className="text-xs justify-center"
                  >
                    {name}: {hasData ? '✓' : '✗'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Debug Actions */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={clearConsole}
                className="text-xs font-mono flex-1"
              >
                Clear Console
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logApiState}
                className="text-xs font-mono flex-1"
              >
                Log State
              </Button>
            </div>

            <div className="text-xs font-mono text-muted-foreground text-center pt-1 border-t">
              Dev Mode Only
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}