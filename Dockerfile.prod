FROM node:22

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /hypertube

# Copy root files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY .env ./

COPY apps ./apps

RUN pnpm i --frozen-lockfile