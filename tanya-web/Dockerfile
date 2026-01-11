# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
 
# Ensure src directory and entry-client.js exist before build
RUN ls -l src && test -f src/entry-client.jsx && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server file
COPY server.js .

# Expose port 80
EXPOSE 80

# Set production environment
ENV NODE_ENV=production
ENV PORT=80

# Start the server
CMD ["node", "server.js"]
