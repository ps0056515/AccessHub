FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build React production application
RUN npm run build

# Application ports
EXPOSE 3010 3015

# Start production application
CMD ["npm", "run", "start:deploy"]