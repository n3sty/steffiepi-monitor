'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { apiClient, debugApiClient } from '@/lib/api'
import { useWebSocketData } from '@/lib/hooks/use-websocket-data'
import { SystemOverviewCard } from '@/components/system-overview'
import { CpuDetails } from '@/components/cpu-details'
import { MemoryDetails } from '@/components/memory-details'
import { DockerContainers } from '@/components/docker-containers'
import { DebugPanel } from '@/components/debug-panel'
import { WebSocketStatusBar } from '@/components/websocket-status'
import { swrLogger } from '@/lib/logger'
import { config } from '@/lib/config'
import { 
  Activity, 
  RefreshCw, 
  Server, 
  AlertTriangle,
  TestTube
} from 'lucide-react'

type Tab = 'overview' | 'cpu' | 'memory' | 'docker'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const useWebSocket = config.clientMode === 'real'

  // WebSocket data (real-time)
  const { 
    data: wsData, 
    status: wsStatus, 
    isConnected: wsConnected, 
    connect: wsConnect, 
    error: wsError 
  } = useWebSocketData()

  // Fallback SWR data (polling) - only used when WebSocket is disabled
  const swrConfig = {
    onError: (error: Error, key: string) => {
      swrLogger.error(`SWR Error for ${key}:`, error)
    },
    onSuccess: (data: unknown, key: string) => {
      swrLogger.debug(`SWR Success for ${key}:`, { 
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : [], 
        timestamp: new Date().toISOString() 
      })
    }
  }

  const { data: systemData, error: systemError, isLoading: systemLoading, mutate: mutateSystem } = 
    useSWR(useWebSocket ? null : 'system/overview', apiClient.getSystemOverview, { 
      refreshInterval: 5000,
      ...swrConfig 
    })
  
  const { data: cpuData, error: cpuError, isLoading: cpuLoading, mutate: mutateCpu } = 
    useSWR(useWebSocket ? null : 'system/cpu', apiClient.getCpuMetrics, { 
      refreshInterval: 3000,
      ...swrConfig 
    })
  
  const { data: memoryData, error: memoryError, isLoading: memoryLoading, mutate: mutateMemory } = 
    useSWR(useWebSocket ? null : 'system/memory', apiClient.getMemoryMetrics, { 
      refreshInterval: 5000,
      ...swrConfig 
    })
  
  const { data: dockerData, error: dockerError, isLoading: dockerLoading, mutate: mutateDocker } = 
    useSWR(useWebSocket ? null : 'docker/containers', apiClient.getDockerContainers, { 
      refreshInterval: 10000,
      ...swrConfig 
    })

  // Use WebSocket data when available, fallback to SWR data
  const currentSystemData = useWebSocket ? wsData.system : systemData
  const currentDockerData = useWebSocket ? wsData.docker : dockerData
  
  // For CPU/Memory, we only have system overview from WebSocket, so use SWR for detailed metrics
  const currentCpuData = cpuData
  const currentMemoryData = memoryData

  const isConnected = useWebSocket ? wsConnected : (!systemError && !cpuError && !memoryError)
  const hasErrors = useWebSocket ? !!wsError : (systemError || cpuError || memoryError || dockerError)

  const refreshAll = () => {
    if (useWebSocket) {
      wsConnect() // Reconnect WebSocket
    } else {
      swrLogger.debug('Manual refresh triggered for all endpoints')
      mutateSystem()
      mutateCpu()
      mutateMemory()
      mutateDocker()
    }
  }

  // Debug: Log on component mount
  useEffect(() => {
    debugApiClient()
    if (useWebSocket) {
      swrLogger.debug('Dashboard mounted - Using WebSocket for real-time data')
    } else {
      swrLogger.debug('Dashboard mounted - Using SWR polling for data')
    }
  }, [useWebSocket])

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Activity },
    { id: 'cpu' as Tab, label: 'CPU', icon: Activity },
    { id: 'memory' as Tab, label: 'Memory', icon: Server },
    { id: 'docker' as Tab, label: 'Docker', icon: Server },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center">
                  <Server className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-mono font-medium tracking-tight">Pi Monitor</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-mono text-gray-600">
                    {useWebSocket ? (
                      wsStatus === 'connected' ? 'Live' : 
                      wsStatus === 'connecting' ? 'Connecting' :
                      wsStatus === 'reconnecting' ? 'Reconnecting' :
                      'Disconnected'
                    ) : (
                      isConnected ? 'Connected' : 'Disconnected'
                    )}
                  </span>
                </div>
                {currentSystemData?.hostname && (
                  <div className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono text-gray-700">
                    {currentSystemData.hostname}
                  </div>
                )}
                {config.clientMode === 'mock' && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-orange-100 border border-orange-300 rounded">
                    <TestTube className="h-3 w-3 text-orange-600" />
                    <span className="text-xs font-mono text-orange-700">Mock Data</span>
                  </div>
                )}
                {useWebSocket && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-blue-100 border border-blue-300 rounded">
                    <Activity className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-mono text-blue-700">Real-time</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {hasErrors && (
                <div className="flex items-center space-x-2 px-2 py-1 bg-yellow-100 border border-yellow-300">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-mono text-yellow-700">
                    {useWebSocket ? 'Connection issues' : 'Issues detected'}
                  </span>
                </div>
              )}
              <button 
                onClick={refreshAll}
                className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 flex items-center space-x-2 text-sm font-mono transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{useWebSocket ? 'Reconnect' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <nav>
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-mono border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* WebSocket Status Bar */}
      {useWebSocket && (
        <WebSocketStatusBar
          status={wsStatus}
          lastUpdate={wsData.lastUpdate}
          error={wsError}
          onReconnect={wsConnect}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="bg-white border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-6">
              <SystemOverviewCard 
                data={currentSystemData} 
                loading={useWebSocket ? false : systemLoading} 
                error={useWebSocket ? wsError : systemError?.message}
              />
            </div>
          )}

          {activeTab === 'cpu' && (
            <div className="p-6">
              <CpuDetails 
                data={currentCpuData} 
                loading={cpuLoading} 
                error={cpuError?.message}
              />
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="p-6">
              <MemoryDetails 
                data={currentMemoryData} 
                loading={memoryLoading} 
                error={memoryError?.message}
              />
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="p-6">
              <DockerContainers 
                data={currentDockerData} 
                loading={useWebSocket ? false : dockerLoading} 
                error={useWebSocket ? wsError : dockerError?.message}
              />
            </div>
          )}
        </div>
      </main>

      {/* Debug Panel (Development Only) */}
      <DebugPanel
        systemData={currentSystemData}
        cpuData={currentCpuData}
        memoryData={currentMemoryData}
        dockerData={currentDockerData}
        systemError={useWebSocket ? (wsError ? new Error(wsError) : null) : systemError}
        cpuError={cpuError}
        memoryError={memoryError}
        dockerError={useWebSocket ? (wsError ? new Error(wsError) : null) : dockerError}
        systemLoading={useWebSocket ? false : systemLoading}
        cpuLoading={cpuLoading}
        memoryLoading={memoryLoading}
        dockerLoading={useWebSocket ? false : dockerLoading}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center text-xs font-mono text-gray-500">
            Raspberry Pi 5 Monitor - Real-time system metrics
          </div>
        </div>
      </footer>
    </div>
  )
}
