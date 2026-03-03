FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies stage
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_URL=https://cms-api.devbygian.com
ARG NODE_ENV=production

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN bun run build

# Production stage with nginx
FROM nginx:alpine AS production

# Accept the API URL again in production stage
ARG VITE_API_URL=https://cms-api.devbygian.com

# Copy built assets from build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Install curl for health checks
RUN apk add --no-cache curl

# Create nginx configuration template with API URL
RUN echo "server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json image/svg+xml; \
    \
    location ~ ^/(users|auth|news|ads|api)/ { \
        proxy_pass ${VITE_API_URL}; \
        proxy_http_version 1.1; \
        proxy_set_header Host \$host; \
        proxy_set_header X-Real-IP \$remote_addr; \
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto \$scheme; \
        proxy_set_header Upgrade \$http_upgrade; \
        proxy_set_header Connection \"upgrade\"; \
        proxy_buffering off; \
        proxy_request_buffering off; \
        proxy_connect_timeout 60s; \
        proxy_send_timeout 60s; \
        proxy_read_timeout 60s; \
    } \
    \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ { \
        expires 1y; \
        add_header Cache-Control \"public, immutable\"; \
    } \
    \
    add_header X-Frame-Options \"SAMEORIGIN\" always; \
    add_header X-Content-Type-Options \"nosniff\" always; \
    add_header X-XSS-Protection \"1; mode=block\" always; \
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always; \
}" | sed "s|\${VITE_API_URL}|${VITE_API_URL}|g" > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]