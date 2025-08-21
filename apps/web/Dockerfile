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

# Install web dependencies
WORKDIR /app/apps/web
COPY apps/web/package.json ./
# Temporarily remove workspace dependency for Docker build
RUN sed -i 's/"@steffiepi\/shared": "workspace:\*"/"@steffiepi\/shared": "file:\/app\/packages\/shared"/g' package.json
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy built shared package
COPY --from=deps /app/packages/shared ./packages/shared

# Copy web dependencies and source
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web/ ./apps/web/

# Build Next.js app
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js application
COPY --from=builder /app/apps/web/public ./public

# Use the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]