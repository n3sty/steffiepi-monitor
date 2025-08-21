#!/bin/bash

set -e

# Configuration - modify these variables for your Pi
PI_HOST=${PI_HOST:-"raspberry.local"}
PI_USER=${PI_USER:-"pi"}
PI_DEPLOY_PATH=${PI_DEPLOY_PATH:-"/home/pi/steffiepi-monitor"}

if [ -z "$1" ]; then
  echo "Usage: $0 <pi-host> [pi-user] [deploy-path]"
  echo "Example: $0 192.168.1.100 pi /opt/steffiepi-monitor"
  echo "Environment variables can also be used:"
  echo "  PI_HOST, PI_USER, PI_DEPLOY_PATH"
  exit 1
fi

PI_HOST="$1"
PI_USER="${2:-$PI_USER}"
PI_DEPLOY_PATH="${3:-$PI_DEPLOY_PATH}"

echo "🍓 Deploying SteffiePI Monitor to Raspberry Pi..."
echo "   Host: $PI_HOST"
echo "   User: $PI_USER" 
echo "   Path: $PI_DEPLOY_PATH"

# Build first
echo "🔨 Building project..."
./scripts/build-all.sh

# Check if deployment archive exists
if [ ! -f "dist/steffiepi-monitor.tar.gz" ]; then
  echo "❌ Deployment archive not found. Build may have failed."
  exit 1
fi

echo "📤 Uploading to Pi..."

# Create deployment directory on Pi
ssh "$PI_USER@$PI_HOST" "mkdir -p $PI_DEPLOY_PATH"

# Upload deployment archive
scp dist/steffiepi-monitor.tar.gz "$PI_USER@$PI_HOST:$PI_DEPLOY_PATH/"

# Extract and setup on Pi
ssh "$PI_USER@$PI_HOST" "
  cd $PI_DEPLOY_PATH
  echo '🗂️  Extracting deployment archive...'
  tar -xzf steffiepi-monitor.tar.gz
  cd pi-deployment
  
  echo '📦 Installing dependencies...'
  chmod +x pi-setup.sh start-services.sh
  ./pi-setup.sh
  
  echo '🚀 Starting services...'
  ./start-services.sh
  
  echo '✅ Deployment complete!'
  echo '🌐 Web interface: http://$PI_HOST:3000'
  echo '🖥️  Monitor API: http://$PI_HOST:3001'
"

echo "🎉 Successfully deployed to Raspberry Pi!"
echo "🌐 Web interface: http://$PI_HOST:3000"
echo "🖥️  Monitor API: http://$PI_HOST:3001/api/health"