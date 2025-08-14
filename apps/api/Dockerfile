# Multi-stage build para npm workspaces
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar dependências de todo o workspace
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci

# Build shared package primeiro
FROM base AS shared-builder
COPY packages/shared ./packages/shared
COPY --from=deps /app/node_modules ./node_modules
WORKDIR /app/packages/shared
RUN npm run build

# Build API
FROM base AS builder
COPY apps/api ./apps/api
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
WORKDIR /app/apps/api
RUN npm run build

# Runtime stage
FROM base AS runner
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/packages/shared ./packages/shared
COPY apps/api/package*.json ./

EXPOSE 3001
CMD ["node", "dist/index.js"]