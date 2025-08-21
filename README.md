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

For complete Pi setup and management instructions, see **[PI-OPERATIONS.md](./PI-OPERATIONS.md)** 📖

**Quick setup overview:**

1. **Clone on your Pi**
```bash
git clone <your-repo-url>
cd steffiepi-monitor
npm install && npm run build
```

2. **Start with Docker** (recommended)
```bash
docker-compose -f docker-compose.pi.yml up -d
```

3. **Or start with PM2**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

4. **Access your dashboard**
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

### Local Development
```bash
docker-compose up -d
```

### Pi Deployment
```bash
# Automatic deployment (recommended)
npm run deploy:pi:docker <pi-host>

# Manual deployment on Pi
scp -r . pi@your-pi-ip:/home/pi/steffiepi-monitor/
ssh pi@your-pi-ip
cd /home/pi/steffiepi-monitor
docker-compose -f docker-compose.pi.yml up -d
```

### Container Management on Pi
```bash
# View status
docker-compose -f docker-compose.pi.yml ps

# View logs
docker-compose -f docker-compose.pi.yml logs

# Restart services
docker-compose -f docker-compose.pi.yml restart

# Stop services
docker-compose -f docker-compose.pi.yml down
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

## 🍓 Pi Operations

For complete Pi deployment, management, and troubleshooting instructions, see **[PI-OPERATIONS.md](./PI-OPERATIONS.md)**

This includes:
- 🚀 Initial setup and deployment options (Docker & PM2)
- 🔄 Updating after git commits  
- 📊 Monitoring and log management
- 🐛 Troubleshooting common issues
- ⚙️ Configuration and environment setup

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