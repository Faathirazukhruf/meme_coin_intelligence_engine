# Meme Coin Intelligence Engine

> On-chain Meme Discovery, Risk Analysis & Quantitative Opportunity Intelligence (Solana-First V1).

## Philosophy: Math First → AI Second
The system measures market structure, order flow, liquidity dynamics, holder behavior, wallet relationships, and social attention. Core intelligence and signal generation are deterministic mathematical models. AI/LLM is secondary supporting enrichment.

---

## Repository Structure

```
meme_coin_intelligence_engine/
├── apps/
│   ├── web/        # Next.js lightweight mobile-first UI
│   ├── api/        # Fastify REST/WebSocket server
│   └── worker/     # Background worker pipeline & schedulers
├── packages/
│   ├── types/      # Canonical domain types & event taxonomy
│   ├── config/     # Zod-validated configuration & baseline weights
│   ├── utils/      # Pino logger, errors, time & anti-look-ahead helpers
│   ├── math/       # Pure deterministic mathematical formulas & normalization
│   ├── core/       # S3/MinIO storage abstraction & pipeline contracts
│   ├── providers/  # Provider contracts & health tracker
│   └── database/   # Prisma ORM client & raw SQL analytics helpers
├── prisma/         # Canonical PostgreSQL schema & migrations
├── docs/           # Complete architectural documentation
├── tests/          # Vitest test suite (Unit, Integration, Anti-Look-Ahead)
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## Quickstart

```bash
# Install dependencies
pnpm install

# Start PostgreSQL, Redis, MinIO
docker compose up -d

# Generate Prisma Client & push schema
pnpm db:generate
pnpm db:push

# Run tests
pnpm test

# Run API in development mode
pnpm dev
```

---

## Documentation
- [Architecture](docs/architecture.md)
- [Canonical Data Model](docs/data-model.md)
- [Event Taxonomy](docs/events.md)
- [Feature Engine V1](docs/features.md)
- [Scoring & Hard Veto](docs/scoring.md)
- [Provider Layer](docs/providers.md)
- [Backtesting Framework](docs/backtesting.md)
- [Development Guide](docs/development.md)
