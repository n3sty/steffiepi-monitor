'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { formatBytes, formatUptime, formatPercentage } from "@/lib/utils"
import { SystemOverview } from "@/lib/types"
import { 
  Cpu, 
  MemoryStick, 
  HardDrive,
  Server
} from "lucide-react"

interface SystemOverviewProps {
  data?: SystemOverview
  loading?: boolean
  error?: string
}

export function SystemOverviewCard({ data, loading, error }: SystemOverviewProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Server className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* System Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Info</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Hostname</span>
              <span className="text-xs font-mono">{data.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Uptime</span>
              <span className="text-xs font-mono">{formatUptime(data.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Load Avg</span>
              <span className="text-xs font-mono">
                {data.loadAverage.map(l => l.toFixed(2)).join(' ')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPU Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(data.cpu.usage)}</div>
          <Progress value={data.cpu.usage} className="mt-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{data.cpu.cores} cores</span>
            <span>{data.cpu.temperature}°C</span>
          </div>
        </CardContent>
      </Card>

      {/* Memory Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <MemoryStick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(data.memory.usage)}</div>
          <Progress value={data.memory.usage} className="mt-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatBytes(data.memory.used)}</span>
            <span>{formatBytes(data.memory.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Disk Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(data.disk.usage)}</div>
          <Progress value={data.disk.usage} className="mt-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatBytes(data.disk.used)}</span>
            <span>{formatBytes(data.disk.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}