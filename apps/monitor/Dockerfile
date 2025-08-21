FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package.json for workspace setup
COPY package*.json ./
COPY turbo.json ./

# Copy all package.json files
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/monitor/package.json ./apps/monitor/package.json

# Install dependencies for the workspace
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/turbo.json ./

# Copy source code
COPY packages/ ./packages/
COPY apps/monitor/ ./apps/monitor/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build monitor app
WORKDIR /app/apps/monitor
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 monitor

# Copy built application and dependencies
COPY --from=builder --chown=monitor:nodejs /app/apps/monitor/dist ./
COPY --from=builder /app/apps/monitor/package.json ./package.json

# Create minimal node_modules with just the shared package
RUN mkdir -p node_modules/@steffiepi
COPY --from=builder --chown=monitor:nodejs /app/packages/shared/dist ./node_modules/@steffiepi/shared/dist/
COPY --from=builder --chown=monitor:nodejs /app/packages/shared/package.json ./node_modules/@steffiepi/shared/package.json

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

USER monitor

EXPOSE 3001

CMD ["node", "index.js"]