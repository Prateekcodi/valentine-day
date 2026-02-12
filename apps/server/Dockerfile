FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use install instead of ci for flexibility)
RUN npm install

# Copy source
COPY src ./src

# Expose port
EXPOSE 3001

# Start with tsx
CMD ["npx", "tsx", "src/index.ts"]
