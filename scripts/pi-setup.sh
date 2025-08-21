#!/bin/bash

set -e

echo "🍓 Setting up SteffiePI Monitor on Raspberry Pi..."

# Update system
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not already installed)
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  sudo npm install -g pm2
fi

# Install production dependencies for monitor
echo "📦 Installing monitor dependencies..."
cd monitor
npm ci --omit=dev
cd ..

# Install production dependencies for web
echo "📦 Installing web dependencies..."
cd web
npm ci --omit=dev
cd ..

# Install shared dependencies
echo "📦 Installing shared dependencies..."
cd shared
npm ci --omit=dev
cd ..

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://$(hostname -I | awk '{print $1}'):3000
EOF

# Create PM2 ecosystem file
echo "⚙️  Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'steffiepi-monitor',
      script: './monitor/index.js',
      cwd: '/home/pi/steffiepi-monitor/pi-deployment',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
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
      cwd: '/home/pi/steffiepi-monitor/pi-deployment/web',
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

# Setup systemd service for auto-start
echo "⚙️  Setting up systemd service..."
sudo tee /etc/systemd/system/steffiepi-monitor.service > /dev/null << EOF
[Unit]
Description=SteffiePI Monitor
After=network.target

[Service]
Type=forking
User=pi
WorkingDirectory=/home/pi/steffiepi-monitor/pi-deployment
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 restart ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
ExecDelete=/usr/bin/pm2 delete ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable steffiepi-monitor.service

echo "✅ Setup complete!"
echo "🔧 Use './start-services.sh' to start the services"
echo "🔧 Use 'sudo systemctl status steffiepi-monitor' to check service status"