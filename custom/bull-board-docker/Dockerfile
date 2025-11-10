FROM node:22

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /bull-board

COPY ./bull-board .

RUN pnpm i --frozen-lockfile
RUN pnpm build
CMD ["pnpm", "start"]