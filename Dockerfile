FROM node:20.11.1-alpine3.19
WORKDIR /app

RUN apk add --no-cache git

RUN corepack enable && corepack prepare pnpm@9.12.1 --activate

# Force Rollup to use JS implementation instead of native
ENV ROLLUP_SKIP_NODEJS_NATIVE=1
ENV ROLLUP_NATIVE_ONLY=0

# Copy all package files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages packages/
COPY srcbook srcbook/
COPY turbo.json ./

# Install dependencies
RUN pnpm install

# Build the application
RUN pnpm build

# Create necessary directories for volumes
RUN mkdir -p /root/.srcbook /root/.npm

# Source code will be mounted at runtime
CMD [ "pnpm", "start" ]

EXPOSE 2150