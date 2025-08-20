'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { MemoryMetrics } from "@/lib/types"
import { MemoryStick } from "lucide-react"
import { formatBytes, formatPercentage } from "@/lib/utils"

interface MemoryDetailsProps {
  data?: MemoryMetrics
  loading?: boolean
  error?: string
}

export function MemoryDetails({ data, loading, error }: MemoryDetailsProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Memory Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
            <MemoryStick className="h-5 w-5" />
            Memory Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const getMemoryColor = (usage: number) => {
    if (usage > 90) return "text-red-500"
    if (usage > 75) return "text-orange-500"
    if (usage > 50) return "text-yellow-500"
    return "text-green-500"
  }

  const swapUsage = data.swap.total > 0 ? (data.swap.used / data.swap.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* RAM Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            RAM Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total Usage</span>
              <span className={`text-2xl font-bold ${getMemoryColor(data.usage)}`}>
                {formatPercentage(data.usage)}
              </span>
            </div>
            <Progress value={data.usage} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Used:</span>
                <span className="font-mono">{formatBytes(data.used)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-mono">{formatBytes(data.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free:</span>
                <span className="font-mono">{formatBytes(data.free)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-mono">{formatBytes(data.available)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cache & Buffers */}
        <Card>
          <CardHeader>
            <CardTitle>Cache & Buffers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cached</span>
                  <span className="text-sm font-mono">{formatBytes(data.cached)}</span>
                </div>
                <Progress 
                  value={(data.cached / data.total) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Buffers</span>
                  <span className="text-sm font-mono">{formatBytes(data.buffers)}</span>
                </div>
                <Progress 
                  value={(data.buffers / data.total) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swap Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Swap Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {data.swap.total > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage</span>
                  <span className={`text-lg font-bold ${getMemoryColor(swapUsage)}`}>
                    {formatPercentage(swapUsage)}
                  </span>
                </div>
                <Progress value={swapUsage} className="h-2" />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-mono">{formatBytes(data.swap.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-mono">{formatBytes(data.swap.total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No swap configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}