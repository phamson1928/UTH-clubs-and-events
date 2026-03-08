FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder and other necessary files
COPY --from=builder /app/dist ./dist

# Create uploads directory if it's used for storing files locally
RUN mkdir -p uploads

# Expose the application port (assuming 3000, adjust if different in your .env)
EXPOSE 3000

# Run the application
CMD ["node", "dist/src/main.js"]
