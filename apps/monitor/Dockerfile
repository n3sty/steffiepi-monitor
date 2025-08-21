FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../packages/shared/package.json ./packages/shared/
COPY ../../packages/shared ./packages/shared

# Install dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build monitor app
WORKDIR /app
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 monitor

# Copy built application
COPY --from=builder --chown=monitor:nodejs /app/dist ./
COPY --from=builder --chown=monitor:nodejs /app/packages/shared/dist ./node_modules/@steffiepi/shared/dist/
COPY --from=builder --chown=monitor:nodejs /app/packages/shared/package.json ./node_modules/@steffiepi/shared/

USER monitor

EXPOSE 3001

CMD ["node", "index.js"]