import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { getPiSystemOverview } from '@/lib/pi-client'
import { SystemOverview } from '@/lib/types'

// Mock system data for development
async function getMockSystemOverview(): Promise<SystemOverview> {
  const os = await import('os')
  const hostname = os.hostname()
  const uptime = os.uptime()
  const loadAvg = os.loadavg()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const cpus = os.cpus()

  return {
    hostname,
    uptime,
    loadAverage: loadAvg as [number, number, number],
    cpu: {
      usage: Math.random() * 100,
      cores: cpus.length,
      temperature: 45 + Math.random() * 20
    },
    memory: {
      total: totalMem,
      used: totalMem - freeMem,
      free: freeMem,
      usage: ((totalMem - freeMem) / totalMem) * 100
    },
    disk: {
      total: 32 * 1024 * 1024 * 1024, // Mock 32GB
      used: 16 * 1024 * 1024 * 1024, // Mock 16GB used
      free: 16 * 1024 * 1024 * 1024, // Mock 16GB free
      usage: 50 // Mock 50% usage
    }
  }
}

// Real system overview from Pi backend
async function getRealSystemOverview(): Promise<SystemOverview> {
  try {
    return await getPiSystemOverview()
  } catch (error) {
    // Fall back to mock data if Pi is unavailable
    if (config.isDevelopment) {
      console.warn('⚠️ Pi system overview failed, using mock data:', error)
    }
    return getMockSystemOverview()
  }
}

export async function GET() {
  const startTime = performance.now()
  
  try {
    if (config.isDevelopment) {
      console.log(`🔄 API Proxy [${config.mode}]: GET /api/system/overview`)
    }

    // Choose data source based on configuration
    const data = config.mode === 'real'
      ? await getRealSystemOverview()
      : await getMockSystemOverview()

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    if (config.isDevelopment) {
      console.log(`✅ System Overview API [${config.mode}]: ${responseTime}ms`, {
        hostname: data.hostname,
        cpu: `${data.cpu.usage.toFixed(1)}%`,
        memory: `${data.memory.usage.toFixed(1)}%`,
        disk: `${data.disk.usage.toFixed(1)}%`
      })
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    if (config.isDevelopment) {
      console.error(`💥 System Overview API Error (${responseTime}ms):`, error)
    }

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