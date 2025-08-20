# SteffiePI Monitor

A Next.js dashboard for monitoring Raspberry Pi system metrics and Docker containers, designed to work seamlessly with the [node-monitor](../node-monitor) backend service.

## Features

- **🖥️ System Monitoring**: CPU, memory, disk usage, and network statistics
- **🐳 Docker Integration**: Container status, resource usage, and logs
- **⚡ Real-time Updates**: WebSocket streaming and SWR data fetching
- **🌐 Hybrid Architecture**: Mock data for development, real Pi backend for production
- **🎨 Modern UI**: Built with Tailwind CSS and Radix UI components
- **🔧 Debug Panel**: Development tools and API metrics
- **🔄 Smart Proxy**: Automatic fallback from real to mock data

## Architecture Overview

This project implements a **hybrid proxy pattern** that bridges the gap between development and production:

```
Frontend (Next.js) → API Routes (Proxy) → Pi Backend OR Mock Data
                                       ↘ WebSocket (real-time)
```

### Modes

- **Mock Mode** (`MONITOR_MODE=mock`): Uses generated data for development
- **Real Mode** (`MONITOR_MODE=real`): Connects to actual Raspberry Pi backend
- **Auto-fallback**: Gracefully falls back to mock data if Pi is unavailable

## Quick Start

### 1. Environment Setup

Copy the environment template and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` based on your setup:

**For Development (Mock Data):**
```env
MONITOR_MODE=mock
NEXT_PUBLIC_MONITOR_MODE=mock
```

**For Production (Real Pi Backend):**
```env
MONITOR_MODE=real
NEXT_PUBLIC_MONITOR_MODE=real
MONITOR_API_URL=https://your-pi.local:3001
MONITOR_API_KEY=your-secure-api-key
MONITOR_WEBSOCKET_URL=wss://your-pi.local:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 4. Test Integration

Run the integration test to verify all endpoints work:

```bash
# Start the dev server first (npm run dev)
node test-integration.js
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONITOR_MODE` | Backend mode: `mock` or `real` | `mock` | No |
| `NEXT_PUBLIC_MONITOR_MODE` | Client-side mode | `mock` | No |
| `MONITOR_API_URL` | Pi backend URL | `https://localhost:3001` | If `real` mode |
| `MONITOR_API_KEY` | Pi backend API key | - | If `real` mode |
| `MONITOR_WEBSOCKET_URL` | WebSocket URL for real-time data | `wss://localhost:3001` | If `real` mode |

#### Logging Configuration

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging level | `warn` | `error`, `warn`, `info`, `debug`, `trace` |
| `LOG_ENABLED` | Enable/disable logging | `true` in dev | `true`, `false` |
| `LOG_PREFIX` | Custom log prefix | `🔍` | Any string |

### Mode Switching

You can switch between mock and real data by changing the `MONITOR_MODE` environment variable:

```bash
# Development with mock data
MONITOR_MODE=mock npm run dev

# Testing with real Pi backend
MONITOR_MODE=real npm run dev
```

### Logging Control

The application now uses a centralized logging system that can be controlled via environment variables:

```bash
# Minimal logging (only errors and warnings)
LOG_LEVEL=warn npm run dev

# Verbose logging for debugging
LOG_LEVEL=debug npm run dev

# Disable all logging
LOG_ENABLED=false npm run dev

# Custom log prefix
LOG_PREFIX=🍓 npm run dev
```

**Log Levels:**
- `error`: Only error messages
- `warn`: Errors and warnings (default)
- `info`: Errors, warnings, and info messages
- `debug`: All messages including debug info
- `trace`: All messages including trace info

## Backend Integration

This frontend is designed to work with the [node-monitor](../node-monitor) backend service. The backend should be running on your Raspberry Pi with:

- **API Endpoints**: `/api/system/*`, `/api/docker/*`, `/api/health`
- **WebSocket**: `/ws/metrics` for real-time data streaming  
- **Authentication**: Bearer token via `Authorization` header
- **CORS**: Configured to allow requests from your frontend domain

### Setting Up Pi Backend

1. Deploy node-monitor to your Raspberry Pi
2. Configure environment variables and API key
3. Start the service: `pm2 start ecosystem.config.js`
4. Update your `.env.local` with the Pi's details

## Development

### Project Structure

```
src/
├── app/api/               # Next.js API routes (proxy layer)
├── components/            # React components
├── lib/
│   ├── api.ts            # Frontend API client
│   ├── config.ts         # Environment configuration
│   ├── pi-client.ts      # Pi backend HTTP client
│   ├── websocket-client.ts # WebSocket real-time client
│   └── types.ts          # TypeScript interfaces
└── ...
```

### Key Components

- **API Routes**: Smart proxies that switch between mock/real data
- **Pi Client**: Robust HTTP client with retry logic and error handling
- **WebSocket Client**: Real-time data streaming with auto-reconnection
- **Type Safety**: Full TypeScript coverage with shared interfaces

### Adding New Endpoints

1. Add the endpoint to the Pi backend
2. Update `types.ts` with new interfaces
3. Add the endpoint to `pi-client.ts`
4. Create/update the corresponding API route in `app/api/`
5. Add mock data for development

## API Endpoints

| Endpoint | Description | Mock Data | Real Backend |
|----------|-------------|-----------|--------------|
| `/api/health` | Service health check | ✅ | ✅ |
| `/api/system/overview` | System metrics overview | ✅ | ✅ |
| `/api/system/cpu` | Detailed CPU metrics | ✅ | ✅ |
| `/api/system/memory` | Memory usage details | ✅ | ✅ |
| `/api/docker/containers` | Docker container list | ✅ | ✅ |

### Response Format

All endpoints return a consistent format:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Real-time Features

### WebSocket Integration

When in `real` mode, the dashboard connects to the Pi's WebSocket endpoint for live updates:

```typescript
// Automatic real-time connection
const wsClient = createWebSocketClient({
  onMessage: (message) => {
    // Handle real-time system/docker updates
  }
});
```

### SWR Integration

Data fetching uses SWR for efficient caching and revalidation:

```typescript
// Automatic polling and caching  
const { data, error } = useSWR('/api/system/overview', fetcher, {
  refreshInterval: 5000 // 5-second updates
});
```

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Docker (Optional)
```bash
docker build -t steffiepi-monitor .
docker run -p 3000:3000 --env-file .env.local steffiepi-monitor
```

## Troubleshooting

### Common Issues

1. **Pi Connection Failed**: Check `MONITOR_API_URL` and network connectivity
2. **Authentication Error**: Verify `MONITOR_API_KEY` matches Pi backend
3. **WebSocket Issues**: Ensure Pi WebSocket service is running on correct port
4. **CORS Errors**: Configure Pi backend to allow your frontend domain

### Debug Tools

- **Debug Panel**: Available in development mode (bottom of dashboard)
- **Console Logging**: Detailed API request/response logs in dev mode
- **Integration Test**: Run `node test-integration.js` to verify all endpoints

### Environment Issues

```bash
# Check configuration
npm run dev
# Look for configuration logs in console

# Test specific mode
MONITOR_MODE=real npm run dev
```

## Contributing

1. Follow existing patterns for new features
2. Update both mock and real implementations
3. Add appropriate TypeScript types
4. Test with both mock and real modes
5. Update documentation as needed

---

**Related Projects:**
- [node-monitor](../node-monitor) - Raspberry Pi backend service
- Built with Next.js 15, TypeScript, Tailwind CSS, and SWR
