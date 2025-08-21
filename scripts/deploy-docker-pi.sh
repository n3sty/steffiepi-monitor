#!/bin/bash

set -e

# Configuration - modify these variables for your Pi
PI_HOST=${PI_HOST:-"raspberry.local"}
PI_USER=${PI_USER:-"pi"}
PI_DEPLOY_PATH=${PI_DEPLOY_PATH:-"/home/pi/steffiepi-monitor"}

if [ -z "$1" ]; then
  echo "Usage: $0 <pi-host> [pi-user] [deploy-path]"
  echo "Example: $0 192.168.1.100"
  echo "Example: $0 raspberry.local pi /opt/steffiepi-monitor"
  echo ""
  echo "Environment variables can also be used:"
  echo "  PI_HOST, PI_USER, PI_DEPLOY_PATH"
  exit 1
fi

PI_HOST="$1"
PI_USER="${2:-$PI_USER}"
PI_DEPLOY_PATH="${3:-$PI_DEPLOY_PATH}"

echo "🍓🐳 Deploying SteffiePI Monitor with Docker to Raspberry Pi..."
echo "   Host: $PI_HOST"
echo "   User: $PI_USER" 
echo "   Path: $PI_DEPLOY_PATH"

# Create temporary deployment directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "📦 Preparing deployment files..."

# Copy project files (excluding node_modules and build artifacts)
rsync -av --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='*.log' --exclude='.git' ./ "$TEMP_DIR/"

# Create the deployment archive
cd "$TEMP_DIR"
tar -czf steffiepi-monitor-docker.tar.gz .

echo "📤 Uploading to Pi..."

# Create deployment directory on Pi
ssh "$PI_USER@$PI_HOST" "mkdir -p $PI_DEPLOY_PATH"

# Upload deployment archive
scp steffiepi-monitor-docker.tar.gz "$PI_USER@$PI_HOST:$PI_DEPLOY_PATH/"

echo "🐳 Setting up Docker environment on Pi..."

# Extract and setup on Pi
ssh "$PI_USER@$PI_HOST" "
  cd $PI_DEPLOY_PATH
  
  echo '🗂️  Extracting deployment files...'
  tar -xzf steffiepi-monitor-docker.tar.gz
  rm steffiepi-monitor-docker.tar.gz
  
  echo '🐳 Checking Docker installation...'
  if ! command -v docker &> /dev/null; then
    echo '📦 Installing Docker...'
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker \$USER
    rm get-docker.sh
    echo '⚠️  You may need to log out and back in for Docker group changes to take effect'
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo '📦 Installing Docker Compose...'
    sudo pip3 install docker-compose || {
      # Fallback: install via curl
      sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
      sudo chmod +x /usr/local/bin/docker-compose
    }
  fi
  
  echo '🚀 Building and starting containers...'
  
  # Stop any existing containers
  docker-compose -f docker-compose.pi.yml down || true
  
  # Build and start the services
  docker-compose -f docker-compose.pi.yml up --build -d
  
  echo '✅ Deployment complete!'
  echo ''
  echo '📊 Container Status:'
  docker-compose -f docker-compose.pi.yml ps
  
  echo ''
  echo '🌐 Access your SteffiePI Monitor:'
  echo \"   Web Interface: http://\$(hostname -I | awk '{print \$1}'):3000\"
  echo \"   API Health: http://\$(hostname -I | awk '{print \$1}'):3001/api/health\"
  echo ''
  echo '🔧 Useful Docker commands:'
  echo '   docker-compose -f docker-compose.pi.yml logs     # View logs'
  echo '   docker-compose -f docker-compose.pi.yml ps       # Check status'
  echo '   docker-compose -f docker-compose.pi.yml restart  # Restart services'
  echo '   docker-compose -f docker-compose.pi.yml down     # Stop services'
"

PI_IP=$(ssh "$PI_USER@$PI_HOST" "hostname -I | awk '{print \$1}'")

echo ""
echo "🎉 Successfully deployed to Raspberry Pi with Docker!"
echo "🌐 Web interface: http://$PI_IP:3000"
echo "🖥️  Monitor API: http://$PI_IP:3001/api/health"
echo ""
echo "📱 SSH into your Pi to manage containers:"
echo "   ssh $PI_USER@$PI_HOST"
echo "   cd $PI_DEPLOY_PATH"
echo "   docker-compose -f docker-compose.pi.yml logs"