# syntax=docker/dockerfile:1.6

# --------------------------------------------------------
# Base image with Chromium + FFmpeg + fonts pre-installed.
# We use the official Node 20 slim image and add the
# dependencies Remotion needs to render headlessly.
# --------------------------------------------------------
FROM node:20-bookworm-slim AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    REMOTION_CHROME_MODE=chrome-for-testing \
    NODE_ENV=production

# Chromium runtime libs, FFmpeg, fonts, and tini for proper signal handling.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    tini \
    ffmpeg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libasound2 \
    libatspi2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxshmfence1 \
    libx11-xcb1 \
    libxcb1 \
    libxss1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --------------------------------------------------------
# Dependency installation layer (cached aggressively).
# --------------------------------------------------------
FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# --------------------------------------------------------
# Final image: copy node_modules + source, ready to render.
# --------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pre-warm Remotion's Chromium download so the first render
# doesn't have to fetch the browser at runtime.
RUN npx --yes remotion browser ensure || true

# `out/` is mounted from the host in docker-compose so renders persist.
VOLUME ["/app/out"]

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "render", "--", "AbstractGradient"]
