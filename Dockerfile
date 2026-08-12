FROM node:22-alpine

WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json ./

# Install dependencies
COPY package*.json ./
RUN npm install -g npm@11
RUN npm ci

# Copy application source
COPY . .

# Build React application inside Docker
RUN npm run build

# Runtime port
EXPOSE 3010

# Start production application
CMD ["npm", "run", "start:prod"]