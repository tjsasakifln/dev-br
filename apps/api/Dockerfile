# Base image
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port and start the app
EXPOSE 3001
CMD [ "npm", "run", "start" ]