import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { getPiHealth } from '@/lib/pi-client'
import { HealthStatus } from '@/lib/types'

// Mock health data for development
async function getMockHealth(): Promise<HealthStatus> {
  return {
    status: 'healthy' as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      system: true,
      docker: true,
      cache: true
    }
  }
}

// Real health data from Pi backend
async function getRealHealth(): Promise<HealthStatus> {
  try {
    return await getPiHealth()
  } catch (error) {
    // Fall back to mock data if Pi is unavailable
    if (config.isDevelopment) {
      console.warn('⚠️ Pi health check failed, using mock data:', error)
    }
    return getMockHealth()
  }
}

export async function GET() {
  const startTime = performance.now()
  
  try {
    if (config.isDevelopment) {
      console.log(`🔄 API Proxy [${config.mode}]: GET /api/health`)
    }

    // Choose data source based on configuration
    const data = config.mode === 'real' 
      ? await getRealHealth()
      : await getMockHealth()

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    if (config.isDevelopment) {
      console.log(`✅ Health Check API [${config.mode}]: ${responseTime}ms`, {
        status: data.status,
        uptime: `${Math.round(data.uptime)}s`,
        services: data.services
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
      console.error(`💥 Health Check API Error (${responseTime}ms):`, error)
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