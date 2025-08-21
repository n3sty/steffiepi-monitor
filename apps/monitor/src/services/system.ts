import * as si from 'systeminformation'
import type { SystemOverview, CpuMetrics, MemoryMetrics } from '@steffiepi/shared'
import { createApiResponse } from '@steffiepi/shared'
import { logger } from '../utils/logger.js'

export class SystemService {
  async getOverview(): Promise<SystemOverview> {
    try {
      const [cpu, mem, osInfo] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.osInfo()
      ])

      const diskInfo = await si.fsSize()
      const mainDisk = diskInfo[0] || { size: 0, used: 0, available: 0 }

      return {
        hostname: osInfo.hostname,
        uptime: osInfo.uptime,
        loadAverage: [cpu.avgLoad || 0, 0, 0],
        cpu: {
          usage: Math.round(cpu.currentLoad),
          cores: cpu.cpus?.length || 0,
          temperature: 45 // Will implement temperature reading for Pi
        },
        memory: {
          total: mem.total,
          used: mem.used,
          free: mem.free,
          usage: Math.round((mem.used / mem.total) * 100)
        },
        disk: {
          total: mainDisk.size,
          used: mainDisk.used,
          free: mainDisk.available,
          usage: Math.round((mainDisk.used / mainDisk.size) * 100)
        }
      }
    } catch (error) {
      logger.error('Failed to get system overview:', error as Error)
      throw new Error('Failed to retrieve system metrics')
    }
  }

  async getCpuMetrics(): Promise<CpuMetrics> {
    try {
      const cpu = await si.currentLoad()

      return {
        usage: Math.round(cpu.currentLoad),
        cores: cpu.cpus?.map((core: any, index: number) => ({
          core: index,
          usage: Math.round(core.load)
        })) || [],
        temperature: 45, // Will implement Pi-specific temperature reading
        frequency: 1800, // Will read actual CPU frequency
        loadAverage: {
          '1min': cpu.avgLoad || 0,
          '5min': 0,
          '15min': 0
        }
      }
    } catch (error) {
      logger.error('Failed to get CPU metrics:', error as Error)
      throw new Error('Failed to retrieve CPU metrics')
    }
  }

  async getMemoryMetrics(): Promise<MemoryMetrics> {
    try {
      const mem = await si.mem()

      return {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        available: mem.available,
        usage: Math.round((mem.used / mem.total) * 100),
        swap: {
          total: mem.swaptotal,
          used: mem.swapused,
          free: mem.swapfree
        },
        buffers: mem.buffcache,
        cached: mem.cached
      }
    } catch (error) {
      logger.error('Failed to get memory metrics:', error as Error)
      throw new Error('Failed to retrieve memory metrics')
    }
  }
}