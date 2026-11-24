
FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

RUN corepack enable \
    && corepack prepare pnpm@10.33.3 --activate

FROM base AS build

COPY . .

RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Build backend and frontend
RUN pnpm --filter api build
RUN pnpm --filter web build

FROM build AS api

ENV NODE_ENV=production
WORKDIR /workspace/apps/api

EXPOSE 5000

CMD ["node", "dist/server.mjs"]

FROM build AS web

ENV NODE_ENV=production
WORKDIR /workspace/apps/web

EXPOSE 3300

CMD ["pnpm", "start"]
