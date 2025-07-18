FROM node:22

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /hypertube

# Copy root package files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy individual package.json files
COPY apps/libs/package.json apps/libs/package.json
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json