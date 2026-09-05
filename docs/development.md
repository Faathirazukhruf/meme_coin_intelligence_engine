# Development & Operations Guide

## Prerequisites
- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Start local infrastructure (PostgreSQL, Redis, MinIO)
docker compose up -d

# 3. Generate Prisma client
pnpm db:generate

# 4. Push database schema
pnpm db:push

# 5. Run tests
pnpm test

# 6. Start API server
pnpm --filter @meme-coin/api dev

# 7. Start Web frontend
pnpm --filter @meme-coin/web dev
```
