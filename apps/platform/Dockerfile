# Base image
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy workspace files from root
COPY package*.json ./
COPY yarn.lock* ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy platform app
COPY apps/platform ./apps/platform

# Set working directory to platform
WORKDIR /usr/src/app/apps/platform

# Install dependencies from root
WORKDIR /usr/src/app
RUN npm install

# Go back to platform directory
WORKDIR /usr/src/app/apps/platform

# Build Next.js
RUN npm run build

# Expose port and start the app
EXPOSE 3000
CMD [ "npm", "run", "start" ]