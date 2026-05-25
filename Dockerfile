# syntax=docker/dockerfile:1.7

# Remotion needs Chromium at render-time, so we use a Node 22 (Debian Bookworm)
# base image and install the Chromium runtime libraries that the bundled
# Chrome Headless Shell requires.
FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=development \
    REMOTION_DISABLE_CRASH_REPORTS=1

# Chromium runtime deps + a few fonts so rendered text looks right.
# Reference: https://www.remotion.dev/docs/docker
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libasound2 \
        libxrandr2 \
        libxkbcommon0 \
        libxfixes3 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxi6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        libgbm1 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libcairo2 \
        libcups2 \
        libdrm2 \
        libexpat1 \
        libuuid1 \
        fonts-liberation \
        fonts-noto-color-emoji \
        fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps first for better layer caching.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund; \
    else \
        npm install --no-audit --no-fund; \
    fi

# Pre-download the Chrome Headless Shell that Remotion drives so the first
# render inside the container is fast and offline-safe.
RUN npx --yes remotion browser ensure

# Copy the rest of the project (node_modules excluded via .dockerignore).
COPY . .

# Render output dir (overridable via volume mount).
RUN mkdir -p /app/out

EXPOSE 3000

# Default to launching the interactive Remotion Studio. Override CMD to render:
#   docker run --rm -v "$PWD/out:/app/out" remotion-microstock \
#       npx remotion render KenBurns out/kenburns.mp4
CMD ["npx", "remotion", "studio", "--no-open", "--port", "3000"]
