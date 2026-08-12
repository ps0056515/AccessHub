FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --include=dev

# Copy application source
COPY . .

# Build React application
RUN npm run build

EXPOSE 3010

# Start production application
CMD ["npm", "run", "start:prod"]