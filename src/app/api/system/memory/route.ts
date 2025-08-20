import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { getPiMemoryMetrics } from '@/lib/pi-client'
import { MemoryMetrics } from '@/lib/types'

// Mock memory data for development
async function getMockMemoryMetrics(): Promise<MemoryMetrics> {
  const os = await import('os')
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  // Mock some values that aren't directly available from os module
  const available = freeMem + (usedMem * 0.3) // Mock available memory
  const buffers = usedMem * 0.1 // Mock buffers
  const cached = usedMem * 0.2 // Mock cached

  return {
    total: totalMem,
    used: usedMem,
    free: freeMem,
    available,
    usage: (usedMem / totalMem) * 100,
    swap: {
      total: totalMem * 0.5,
      used: totalMem * 0.1,
      free: totalMem * 0.4
    },
    buffers,
    cached
  }
}

// Real memory data from Pi backend
async function getRealMemoryMetrics(): Promise<MemoryMetrics> {
  try {
    return await getPiMemoryMetrics()
  } catch (error) {
    if (config.isDevelopment) {
      console.warn('⚠️ Pi memory metrics failed, using mock data:', error)
    }
    return getMockMemoryMetrics()
  }
}

export async function GET() {
  const startTime = performance.now()
  
  try {
    if (config.isDevelopment) {
      console.log(`🔄 API Proxy [${config.mode}]: GET /api/system/memory`)
    }

    const data = config.mode === 'real'
      ? await getRealMemoryMetrics()
      : await getMockMemoryMetrics()
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    if (config.isDevelopment) {
      console.log(`✅ Memory Metrics API [${config.mode}]: ${responseTime}ms`, {
        usage: `${data.usage.toFixed(1)}%`,
        used: `${Math.round(data.used / (1024 * 1024 * 1024))}GB`,
        total: `${Math.round(data.total / (1024 * 1024 * 1024))}GB`
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
      console.error(`💥 Memory Metrics API Error (${responseTime}ms):`, error)
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