'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { CpuMetrics } from "@/lib/types"
import { Cpu, Thermometer, Zap } from "lucide-react"
import { formatPercentage } from "@/lib/utils"

interface CpuDetailsProps {
  data?: CpuMetrics
  loading?: boolean
  error?: string
}

export function CpuDetails({ data, loading, error }: CpuDetailsProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            CPU Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
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
            <Cpu className="h-5 w-5" />
            CPU Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const getTemperatureColor = (temp: number) => {
    if (temp > 80) return "text-red-500"
    if (temp > 70) return "text-orange-500"
    if (temp > 60) return "text-yellow-500"
    return "text-green-500"
  }

  const getUsageColor = (usage: number) => {
    if (usage > 90) return "text-red-500"
    if (usage > 75) return "text-orange-500"
    if (usage > 50) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div className="space-y-6">
      {/* Overall CPU Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            CPU Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Usage</span>
                <span className={`text-lg font-bold ${getUsageColor(data.usage)}`}>
                  {formatPercentage(data.usage)}
                </span>
              </div>
              <Progress value={data.usage} className="h-2" />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  Temperature
                </span>
                <span className={`text-lg font-bold ${getTemperatureColor(data.temperature)}`}>
                  {data.temperature}°C
                </span>
              </div>
              <Progress value={(data.temperature / 100) * 100} className="h-2" />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Frequency
                </span>
                <span className="text-lg font-bold">
                  {data.frequency} MHz
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Core Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Core Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.cores.map((core) => (
              <div key={core.core} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Core {core.core}</span>
                  <span className={`text-sm font-bold ${getUsageColor(core.usage)}`}>
                    {formatPercentage(core.usage)}
                  </span>
                </div>
                <Progress value={core.usage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Load Average */}
      <Card>
        <CardHeader>
          <CardTitle>Load Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.loadAverage['1min'].toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">1 minute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.loadAverage['5min'].toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">5 minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.loadAverage['15min'].toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">15 minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}