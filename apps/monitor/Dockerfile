FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Build shared package first
WORKDIR /app/packages/shared
COPY packages/shared/package.json ./
RUN npm install
COPY packages/shared/ ./
RUN npm run build

# Install monitor dependencies
WORKDIR /app/apps/monitor
COPY apps/monitor/package.json ./
# Temporarily remove workspace dependency for Docker build
RUN sed -i 's/"@steffiepi\/shared": "workspace:\*"/"@steffiepi\/shared": "file:\/app\/packages\/shared"/g' package.json
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy built shared package
COPY --from=deps /app/packages/shared ./packages/shared

# Copy monitor dependencies and source
COPY --from=deps /app/apps/monitor/node_modules ./apps/monitor/node_modules
COPY apps/monitor/ ./apps/monitor/

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