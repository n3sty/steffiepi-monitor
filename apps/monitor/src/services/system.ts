import * as si from 'systeminformation'
import type { SystemOverview, CpuMetrics, MemoryMetrics } from '@steffiepi/shared'
import { createApiResponse } from '@steffiepi/shared'
import { logger } from '../utils/logger.js'

export class SystemService {
  async getOverview(): Promise<SystemOverview> {
    try {
      const [cpu, mem, load, osInfo] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.loadavg(),
        si.osInfo()
      ])

      const diskInfo = await si.fsSize()
      const mainDisk = diskInfo[0] || { size: 0, used: 0, available: 0 }

      return {
        hostname: osInfo.hostname,
        uptime: osInfo.uptime,
        loadAverage: [load.avgLoad1, load.avgLoad5, load.avgLoad15],
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
      logger.error('Failed to get system overview:', error)
      throw new Error('Failed to retrieve system metrics')
    }
  }

  async getCpuMetrics(): Promise<CpuMetrics> {
    try {
      const [load, cpu] = await Promise.all([
        si.loadavg(),
        si.currentLoad()
      ])

      return {
        usage: Math.round(cpu.currentLoad),
        cores: cpu.cpus?.map((core, index) => ({
          core: index,
          usage: Math.round(core.load)
        })) || [],
        temperature: 45, // Will implement Pi-specific temperature reading
        frequency: 1800, // Will read actual CPU frequency
        loadAverage: {
          '1min': load.avgLoad1,
          '5min': load.avgLoad5,
          '15min': load.avgLoad15
        }
      }
    } catch (error) {
      logger.error('Failed to get CPU metrics:', error)
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
      logger.error('Failed to get memory metrics:', error)
      throw new Error('Failed to retrieve memory metrics')
    }
  }
}