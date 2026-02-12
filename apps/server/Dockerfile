FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/server/src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
