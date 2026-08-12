FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install -g npm@11
RUN npm ci

# Copy application source
COPY . .

# Build React application inside Docker
RUN npm run build

# Runtime port
EXPOSE 3010 3015

# Run database migration and start production application
CMD ["sh", "-c", "npm run db:migrate && npm run start:prod"]