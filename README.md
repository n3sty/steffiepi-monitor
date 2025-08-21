# SteffiePI Monitor 🍓

A complete monorepo solution for monitoring Raspberry Pi system metrics and Docker containers, featuring both a lightweight backend monitor and a modern web dashboard that can run entirely on your Pi.

## 🏗️ Architecture

This monorepo contains:
- **`apps/monitor`** - Fastify-based backend service for Pi monitoring
- **`apps/web`** - Next.js dashboard for visualization
- **`packages/shared`** - Shared TypeScript types and utilities
- **`scripts/`** - Deployment and build automation

## ✨ Features

- **🖥️ System Monitoring**: CPU, memory, disk usage, and network statistics
- **🐳 Docker Integration**: Container status, resource usage, and management
- **⚡ Real-time Updates**: WebSocket streaming for live metrics
- **🎨 Modern Web UI**: Beautiful dashboard built with Next.js and Tailwind CSS
- **🍓 Pi-Optimized**: Designed to run efficiently on Raspberry Pi hardware
- **📦 Easy Deployment**: One-command deployment to your Pi

## 🚀 Quick Start

### Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start development servers**
```bash
# Start both monitor and web in development mode
npm run dev

# Or start individually
npm run dev:web      # Web dashboard on :3000
npm run dev:monitor  # Monitor API on :3001
```

### Deploy to Raspberry Pi

1. **One-command deployment**
```bash
npm run deploy:pi <pi-host-or-ip>
```

Example:
```bash
npm run deploy:pi 192.168.1.100
npm run deploy:pi raspberry.local pi /opt/steffiepi-monitor
```

This will:
- Build all packages
- Upload to your Pi
- Install dependencies
- Configure PM2 for process management
- Start both monitor and web services
- Set up auto-start on boot

2. **Access your dashboard**
- Web Interface: `http://your-pi-ip:3000`
- API Health: `http://your-pi-ip:3001/api/health`

## 📁 Project Structure

```
steffiepi-monitor/
├── apps/
│   ├── monitor/          # Backend monitoring service
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # System & Docker services
│   │   │   └── utils/    # Logging & utilities
│   │   └── package.json
│   └── web/              # Frontend Next.js app
│       ├── src/
│       │   ├── app/      # Next.js App Router
│       │   ├── components/ # React components
│       │   └── lib/      # Client utilities
│       └── package.json
├── packages/
│   └── shared/           # Shared types & utilities
│       ├── src/
│       │   ├── types.ts  # TypeScript interfaces
│       │   └── utils.ts  # Shared functions
│       └── package.json
└── scripts/              # Deployment automation
    ├── build-all.sh      # Build all packages
    ├── deploy-to-pi.sh   # Deploy to Pi
    ├── pi-setup.sh       # Pi environment setup
    └── start-services.sh # Start services on Pi
```

## 🛠️ Available Commands

### Root Level
- `npm run dev` - Start all apps in development
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run clean` - Clean all build outputs
- `npm run deploy:pi <host>` - Deploy to Raspberry Pi
- `npm run build:all` - Create deployment archive

### Individual Apps
- `npm run dev:web` - Start only web dashboard
- `npm run dev:monitor` - Start only monitor backend

## 🔧 Configuration

### Environment Variables

**Monitor Backend (`apps/monitor/.env`)**:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

**Web Frontend (`apps/web/.env.local`)**:
```env
MONITOR_MODE=real
NEXT_PUBLIC_MONITOR_MODE=real
MONITOR_API_URL=http://localhost:3001
MONITOR_WEBSOCKET_URL=ws://localhost:3001
```

## 🐳 Docker Support

For containerized deployment:

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 API Endpoints

The monitor backend provides these endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Service health check |
| `/api/system/overview` | System metrics overview |
| `/api/system/cpu` | Detailed CPU metrics |
| `/api/system/memory` | Memory usage details |
| `/api/docker/containers` | Docker container list |
| `/ws/metrics` | WebSocket for real-time updates |

## 🍓 Pi Deployment Details

The deployment process:

1. **Builds** all packages using Turbo
2. **Creates** deployment archive with optimized builds
3. **Uploads** to your Pi via SSH
4. **Installs** Node.js, PM2, and dependencies
5. **Configures** systemd service for auto-start
6. **Starts** both monitor and web services

Services run under PM2 process manager:
- `steffiepi-monitor` - Backend API service
- `steffiepi-web` - Frontend Next.js app

## 🔍 Monitoring

Once deployed, you can monitor the services:

```bash
# On your Pi
pm2 status           # Check service status
pm2 logs             # View logs
pm2 restart all      # Restart services
sudo systemctl status steffiepi-monitor  # Check systemd service
```

## 🚨 Troubleshooting

### Common Issues

1. **Pi Connection Failed**
   - Ensure SSH is enabled on Pi
   - Check network connectivity
   - Verify Pi hostname/IP address

2. **Services Won't Start**
   - Check PM2 logs: `pm2 logs`
   - Verify Node.js installation
   - Check port availability (3000, 3001)

3. **Docker Metrics Missing**
   - Ensure Docker is installed and running
   - Pi user needs Docker group membership: `sudo usermod -aG docker pi`

### Manual Deployment

If automated deployment fails:

1. Build locally: `npm run build:all`
2. Copy `dist/steffiepi-monitor.tar.gz` to Pi
3. Extract and run setup scripts manually

## 🤝 Contributing

1. Clone and install dependencies: `npm install`
2. Make changes in appropriate app/package
3. Test with `npm run dev`
4. Build with `npm run build`
5. Test deployment in local environment

## 📄 License

MIT License - see LICENSE file for details

---

**🍓 Built for Raspberry Pi enthusiasts who want beautiful system monitoring!**