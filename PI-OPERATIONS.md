# SteffiePI Monitor - Pi Operations Cheat Sheet 🍓

Quick reference for running and managing SteffiePI Monitor on your Raspberry Pi.

## 📋 Prerequisites

- Raspberry Pi with SSH access
- Node.js 20+ installed
- Git installed
- Docker and Docker Compose (for Docker deployment)
- PM2 (for direct deployment)

## 🚀 Initial Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/steffiepi-monitor.git
cd steffiepi-monitor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the project
```bash
npm run build
```

## 🐳 Docker Deployment (Recommended)

### Start services
```bash
# Start all services in background
docker compose -f docker-compose.pi.yml up -d

# Start with build (after code changes)
docker compose -f docker-compose.pi.yml up --build -d
```

### Manage containers
```bash
# Check status
docker compose -f docker-compose.pi.yml ps

# View logs
docker compose -f docker-compose.pi.yml logs
docker compose -f docker-compose.pi.yml logs -f  # Follow logs

# Restart services
docker compose -f docker-compose.pi.yml restart

# Stop services
docker compose -f docker-compose.pi.yml down

# Stop and remove volumes
docker compose -f docker-compose.pi.yml down -v
```

### Access services
- **Web Interface**: `http://your-pi-ip:3000`
- **API Health Check**: `http://your-pi-ip:3001/api/health`

## 🔧 Direct PM2 Deployment

### Install PM2
```bash
sudo npm install -g pm2
```

### Create PM2 ecosystem file
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'steffiepi-monitor',
      script: './apps/monitor/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        LOG_LEVEL: 'info'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'steffiepi-web',
      script: 'npm',
      args: 'start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
}
EOF
```

### Start services
```bash
# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

### Manage PM2 services
```bash
# Check status
pm2 status
pm2 list

# View logs
pm2 logs
pm2 logs steffiepi-monitor  # Specific app logs

# Restart services
pm2 restart all
pm2 restart steffiepi-monitor

# Stop services
pm2 stop all
pm2 delete all  # Stop and remove
```

## 🔄 Updating After Git Commits

### Docker deployment
```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker compose -f docker-compose.pi.yml down
docker compose -f docker-compose.pi.yml up --build -d

# Or use restart if no dependency changes
docker compose -f docker-compose.pi.yml restart
```

### PM2 deployment
```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Rebuild the project
npm run build

# Restart PM2 services
pm2 restart all
```

## 📊 Monitoring & Logs

### System resource monitoring
```bash
# Check Pi resources
htop
free -h
df -h

# Docker resource usage
docker stats
```

### Application logs
```bash
# Docker logs
docker compose -f docker-compose.pi.yml logs -f

# PM2 logs
pm2 logs --lines 100
```

### Health checks
```bash
# Check if services are responding
curl http://localhost:3001/api/health
curl http://localhost:3000

# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" http://localhost:3001/ws/metrics
```

## 🐛 Troubleshooting

### Port conflicts
```bash
# Check what's using ports 3000/3001
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill processes if needed
sudo lsof -ti:3000 | xargs sudo kill -9
sudo lsof -ti:3001 | xargs sudo kill -9
```

### Docker issues
```bash
# Clean up Docker
docker system prune -a

# Check Docker daemon
sudo systemctl status docker
sudo systemctl restart docker

# Check container logs for errors
docker compose -f docker-compose.pi.yml logs monitor
docker compose -f docker-compose.pi.yml logs web
```

### PM2 issues
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.js

# Check PM2 daemon
pm2 status
pm2 info steffiepi-monitor
```

### Permission issues
```bash
# Ensure pi user owns the project directory
sudo chown -R pi:pi /path/to/steffiepi-monitor

# Add pi user to docker group (if using Docker)
sudo usermod -aG docker pi
# Log out and back in for changes to take effect
```

## ⚙️ Configuration

### Environment variables
Create `.env` files in respective app directories:

**apps/monitor/.env**:
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000
```

**apps/web/.env.local**:
```env
MONITOR_MODE=real
NEXT_PUBLIC_MONITOR_MODE=real
MONITOR_API_URL=http://localhost:3001
MONITOR_WEBSOCKET_URL=ws://localhost:3001
```

### Systemd service (for PM2 auto-start)
```bash
# Create systemd service
sudo tee /etc/systemd/system/steffiepi-monitor.service > /dev/null << 'EOF'
[Unit]
Description=SteffiePI Monitor
After=network.target

[Service]
Type=forking
User=pi
WorkingDirectory=/home/pi/steffiepi-monitor
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 restart ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable steffiepi-monitor.service
sudo systemctl start steffiepi-monitor.service
```

## 🎯 Quick Commands Summary

| Task | Docker | PM2 |
|------|---------|-----|
| Start services | `docker compose -f docker-compose.pi.yml up -d` | `pm2 start ecosystem.config.js` |
| View logs | `docker compose -f docker-compose.pi.yml logs -f` | `pm2 logs` |
| Restart | `docker compose -f docker-compose.pi.yml restart` | `pm2 restart all` |
| Stop | `docker compose -f docker-compose.pi.yml down` | `pm2 stop all` |
| Status | `docker compose -f docker-compose.pi.yml ps` | `pm2 status` |
| After git pull | `docker compose -f docker-compose.pi.yml up --build -d` | `npm run build && pm2 restart all` |