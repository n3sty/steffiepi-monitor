#!/bin/bash

set -e

echo "🚀 Starting SteffiePI Monitor services..."

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start services using PM2
echo "🖥️  Starting monitor backend..."
pm2 start ecosystem.config.js

# Show status
pm2 status

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u pi --hp /home/pi

echo "✅ Services started successfully!"
echo ""
echo "📊 Service Status:"
pm2 list

echo ""
echo "🌐 Access your SteffiePI Monitor:"
echo "   Web Interface: http://$(hostname -I | awk '{print $1}'):3000"
echo "   API Health: http://$(hostname -I | awk '{print $1}'):3001/api/health"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status          - Check service status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart all services"
echo "   pm2 stop all        - Stop all services"