#!/bin/bash

set -e

echo "🔨 Building SteffiePI Monitor monorepo..."

# Build shared package first
echo "📦 Building shared package..."
cd packages/shared
npm run build
cd ../..

# Build monitor backend
echo "🖥️  Building monitor backend..."
cd apps/monitor
npm run build
cd ../..

# Build web frontend
echo "🌐 Building web frontend..."
cd apps/web
npm run build
cd ../..

echo "✅ All packages built successfully!"

# Create deployment archive
echo "📦 Creating deployment archive..."
mkdir -p dist/pi-deployment

# Copy monitor build
cp -r apps/monitor/dist dist/pi-deployment/monitor
cp apps/monitor/package.json dist/pi-deployment/monitor/

# Copy web build  
cp -r apps/web/.next dist/pi-deployment/web
cp apps/web/package.json dist/pi-deployment/web/
cp -r apps/web/public dist/pi-deployment/web/

# Copy shared package
cp -r packages/shared/dist dist/pi-deployment/shared
cp packages/shared/package.json dist/pi-deployment/shared/

# Copy deployment files
cp scripts/pi-setup.sh dist/pi-deployment/
cp scripts/start-services.sh dist/pi-deployment/
cp docker-compose.prod.yml dist/pi-deployment/docker-compose.yml

# Create tarball
cd dist
tar -czf steffiepi-monitor.tar.gz pi-deployment/
cd ..

echo "📦 Deployment archive created: dist/steffiepi-monitor.tar.gz"
echo "🚀 Ready to deploy to Raspberry Pi!"