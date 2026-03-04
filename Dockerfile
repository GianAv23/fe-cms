# Base image configured with Bun runtime
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Dependencies installed from lock file
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Application built with production settings
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .

# Build arguments accepted for runtime configuration
ARG VITE_API_URL=https://cms-api.devbygian.com
ARG NODE_ENV=production

# Environment variables set for build process
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_URL=${VITE_API_URL}

# Application compiled for production
RUN bun run build

# Nginx configured to serve static assets
FROM nginx:alpine AS production

# API URL parameter accepted for proxy configuration
ARG VITE_API_URL=https://cms-api.devbygian.com

# Built assets copied to nginx root
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Curl installed for container health monitoring
RUN apk add --no-cache curl

# Nginx server configured with API proxy and caching
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

# Container health monitored via HTTP endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]