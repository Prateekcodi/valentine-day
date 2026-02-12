FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including tsx for runtime)
RUN npm ci

# Copy source
COPY src ./src

# Expose port
EXPOSE 3001

# Start with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "src/index.ts"]
