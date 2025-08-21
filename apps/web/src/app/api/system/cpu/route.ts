import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { getPiCpuMetrics } from '@/lib/pi-client'
import { CpuMetrics } from '@/lib/types'
import { apiLogger } from '@/lib/logger'

// Mock CPU data for development
async function getMockCpuMetrics(): Promise<CpuMetrics> {
  const os = await import('os')
  const cpus = os.cpus()
  const loadAvg = os.loadavg()

  // Generate mock per-core data
  const cores = cpus.map((cpu, index) => ({
    core: index,
    usage: Math.random() * 100
  }))

  const overallUsage = cores.reduce((sum, core) => sum + core.usage, 0) / cores.length

  return {
    usage: overallUsage,
    cores,
    temperature: 45 + Math.random() * 20, // Mock temperature
    frequency: cpus[0]?.speed || 2400, // Get from first CPU or default
    loadAverage: {
      '1min': loadAvg[0],
      '5min': loadAvg[1],
      '15min': loadAvg[2]
    }
  }
}

// Real CPU data from Pi backend
async function getRealCpuMetrics(): Promise<CpuMetrics> {
  try {
    return await getPiCpuMetrics()
  } catch (error) {
    apiLogger.warn('Pi CPU metrics failed, using mock data:', error)
    return getMockCpuMetrics()
  }
}

export async function GET() {
  const startTime = performance.now()
  
  try {
    apiLogger.debug(`API Proxy [${config.mode}]: GET /api/system/cpu`)

    const data = config.mode === 'real' 
      ? await getRealCpuMetrics()
      : await getMockCpuMetrics()
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    apiLogger.debug(`CPU Metrics API [${config.mode}]: ${responseTime}ms`, {
      usage: `${data.usage.toFixed(1)}%`,
      cores: data.cores.length,
      temperature: `${data.temperature.toFixed(1)}°C`
    })

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    apiLogger.error(`CPU Metrics API Error (${responseTime}ms):`, error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}