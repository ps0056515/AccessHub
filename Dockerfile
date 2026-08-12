FROM node:22-alpine

WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json ./

# Install ALL dependencies required to build React
RUN npm ci

# Copy application source
COPY . .

# Build React application inside Docker
RUN npm run build

# Runtime port
EXPOSE 3010

# Start production application
CMD ["npm", "run", "start:prod"]