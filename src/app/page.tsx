'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { apiClient, debugApiClient } from '@/lib/api'
import { SystemOverviewCard } from '@/components/system-overview'
import { CpuDetails } from '@/components/cpu-details'
import { MemoryDetails } from '@/components/memory-details'
import { DockerContainers } from '@/components/docker-containers'
import { DebugPanel } from '@/components/debug-panel'
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

  // Debug: Log API client info on component mount
  useEffect(() => {
    debugApiClient()
    swrLogger.debug('Dashboard mounted - SWR will begin polling')
  }, [])

  // Data fetching with SWR - with additional debugging configuration
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
    useSWR('system/overview', apiClient.getSystemOverview, { 
      refreshInterval: 5000,
      ...swrConfig 
    })
  
  const { data: cpuData, error: cpuError, isLoading: cpuLoading, mutate: mutateCpu } = 
    useSWR('system/cpu', apiClient.getCpuMetrics, { 
      refreshInterval: 3000,
      ...swrConfig 
    })
  
  const { data: memoryData, error: memoryError, isLoading: memoryLoading, mutate: mutateMemory } = 
    useSWR('system/memory', apiClient.getMemoryMetrics, { 
      refreshInterval: 5000,
      ...swrConfig 
    })
  
  const { data: dockerData, error: dockerError, isLoading: dockerLoading, mutate: mutateDocker } = 
    useSWR('docker/containers', apiClient.getDockerContainers, { 
      refreshInterval: 10000,
      ...swrConfig 
    })

  const isConnected = !systemError && !cpuError && !memoryError
  const hasErrors = systemError || cpuError || memoryError || dockerError

  const refreshAll = () => {
    swrLogger.debug('Manual refresh triggered for all endpoints')
    mutateSystem()
    mutateCpu()
    mutateMemory()
    mutateDocker()
  }

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
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {systemData?.hostname && (
                  <div className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono text-gray-700">
                    {systemData.hostname}
                  </div>
                )}
                {config.clientMode === 'mock' && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-orange-100 border border-orange-300 rounded">
                    <TestTube className="h-3 w-3 text-orange-600" />
                    <span className="text-xs font-mono text-orange-700">Mock Data</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {hasErrors && (
                <div className="flex items-center space-x-2 px-2 py-1 bg-yellow-100 border border-yellow-300">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-mono text-yellow-700">Issues detected</span>
                </div>
              )}
              <button 
                onClick={refreshAll}
                className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 flex items-center space-x-2 text-sm font-mono transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="bg-white border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-6">
              <SystemOverviewCard 
                data={systemData} 
                loading={systemLoading} 
                error={systemError?.message}
              />
            </div>
          )}

          {activeTab === 'cpu' && (
            <div className="p-6">
              <CpuDetails 
                data={cpuData} 
                loading={cpuLoading} 
                error={cpuError?.message}
              />
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="p-6">
              <MemoryDetails 
                data={memoryData} 
                loading={memoryLoading} 
                error={memoryError?.message}
              />
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="p-6">
              <DockerContainers 
                data={dockerData} 
                loading={dockerLoading} 
                error={dockerError?.message}
              />
            </div>
          )}
        </div>
      </main>

      {/* Debug Panel (Development Only) */}
      <DebugPanel
        systemData={systemData}
        cpuData={cpuData}
        memoryData={memoryData}
        dockerData={dockerData}
        systemError={systemError}
        cpuError={cpuError}
        memoryError={memoryError}
        dockerError={dockerError}
        systemLoading={systemLoading}
        cpuLoading={cpuLoading}
        memoryLoading={memoryLoading}
        dockerLoading={dockerLoading}
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
