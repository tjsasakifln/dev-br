# Multi-stage build para npm workspaces
FROM node:20-slim AS base
WORKDIR /app

# Instalar dependências de todo o workspace
FROM base AS deps
COPY package*.json ./
COPY apps/platform/package*.json ./apps/platform/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci

# Build shared package primeiro
FROM base AS shared-builder
COPY packages/shared ./packages/shared
COPY --from=deps /app/node_modules ./node_modules
WORKDIR /app/packages/shared
RUN npm run build

# Build Platform
FROM base AS builder
COPY apps/platform ./apps/platform
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/packages/shared ./packages/shared
WORKDIR /app/apps/platform
RUN npm run build

# Runtime stage
FROM base AS runner
COPY --from=builder /app/apps/platform/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/packages/shared ./packages/shared
COPY apps/platform/package*.json ./
COPY apps/platform/next.config.* ./

EXPOSE 3000
CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]