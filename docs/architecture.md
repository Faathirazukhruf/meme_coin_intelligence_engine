# System Architecture

## Core Philosophy: Math First → AI Second

The **Meme Coin Intelligence Engine** is a quantitative research and discovery platform built for on-chain Solana tokens. It detects tokens, measures order flow and liquidity dynamics, calculates holder and cluster risks, ranks opportunities, generates explainable signals, and tracks forward outcomes without look-ahead bias.

```
                    NEXT.JS FRONTEND
                           │
                      REST / WS
                           │
                     FASTIFY API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   PostgreSQL            Redis            S3/MinIO
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                      WORKER APP
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
   Ingestion            Features             Backtest
   Snapshots            Scoring              Outcomes
        │
                   PROVIDER LAYER
        │
 ┌──────┼──────────────┬──────────────┬─────────────┐
 │      │              │              │             │
Solana  Helius       Bitquery      Birdeye    DexScreener
 │
 └──────────────── CANONICAL DATA ────────────────┘
```

## Architectural Tenets
1. **On-chain Source of Truth**: External APIs (Birdeye, DexScreener) are auxiliary feeds; on-chain Solana data is the primary ground truth.
2. **Provider Abstraction**: Core processing never calls third-party SDKs directly. All data access is gated through `ChainProvider`, `MarketProvider`, `SocialProvider`, and `NewsProvider`.
3. **Idempotency & Deduplication**: Canonical blockchain events are keyed by `(chainId, transactionHash, eventIndex)`.
4. **Anti-Look-Ahead Rule**: For any feature calculation at anchor timestamp $T_0$, all inputs must strictly satisfy $\text{timestamp} \le T_0$.
5. **Separation of Concerns**: Outcomes ($T+1m$ to $T+24h$, MFE/MAE) are tracked purely from market data, while Paper Execution realistically simulates latency, slippage, and liquidity constraints.
