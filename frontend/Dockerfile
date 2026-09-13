# Stage 1: Build Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and config files
COPY . .

# Build argument for Vite API base URL if needed at build time
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build static assets
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:alpine

# Remove default Nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
