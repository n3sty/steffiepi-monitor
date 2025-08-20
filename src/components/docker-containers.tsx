'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { DockerContainer } from "@/lib/types"
import { Container, Play, Square, AlertCircle, Clock } from "lucide-react"

interface DockerContainersProps {
  data?: DockerContainer[] | null
  loading?: boolean
  error?: string
}

export function DockerContainers({ data, loading, error }: DockerContainersProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Container className="h-5 w-5" />
            Docker Containers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <Container className="h-5 w-5" />
            Docker Containers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Container className="h-5 w-5" />
            Docker Containers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No containers found
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <Badge variant="success" className="flex items-center gap-1">
          <Play className="h-3 w-3" />
          Running
        </Badge>
      case 'exited':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Square className="h-3 w-3" />
          Stopped
        </Badge>
      case 'created':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created
        </Badge>
      default:
        return <Badge variant="warning" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const runningContainers = data.filter(c => c.status === 'running').length
  const totalContainers = data.length

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Container className="h-5 w-5" />
            Docker Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{runningContainers}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalContainers - runningContainers}</div>
              <div className="text-sm text-muted-foreground">Stopped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalContainers}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(data.map(c => c.image)).size}
              </div>
              <div className="text-sm text-muted-foreground">Images</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container List */}
      <Card>
        <CardHeader>
          <CardTitle>Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((container) => (
              <div 
                key={container.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{container.name}</h3>
                      {getStatusBadge(container.status)}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {container.image}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>ID: {container.id}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {container.state}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(container.created)}
                  </div>
                  {container.started && (
                    <div>
                      <span className="font-medium">Started:</span> {formatDate(container.started)}
                    </div>
                  )}
                </div>

                {container.ports && container.ports.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-sm">Ports:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {container.ports.map((port, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {port.publicPort ? `${port.publicPort}:` : ''}{port.privatePort}/{port.type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}