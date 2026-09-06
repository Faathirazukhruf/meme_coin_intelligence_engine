# Provider Layer Architecture

## Provider Abstraction Interfaces
The core engine does not import third-party SDKs directly. All external data providers implement canonical interfaces:
- `ChainProvider`: Blockchain metadata and transaction streams.
- `MarketProvider`: Market price, liquidity, FDV, volume, and OHLCV bars.
- `SocialProvider`: Social sentiment and author activity metrics.
- `NewsProvider`: News feeds and semantic context.

---

## Implemented Providers in V1

### 1. Chain Providers (`@meme-coin/providers`)
- **`SolanaRpcChainProvider`**: Direct JSON-RPC connection to Solana nodes (`getAccountInfo`, `getTransaction`, `getSlot`).
- **`HeliusChainProvider`**: Enhanced transaction parsing and enriched token metadata via Helius APIs.
- **`MockSolanaChainProvider`**: Deterministic in-memory provider for unit tests and historical replay experiments.

### 2. Market Providers (`@meme-coin/providers`)
- **`DexScreenerMarketProvider`**: Real-time token pair, liquidity, and volume metrics from DexScreener REST API.
- **`BirdeyeMarketProvider`**: High-resolution OHLCV bars, token overview, and price feeds from Birdeye API.
- **`MockMarketProvider`**: Deterministic market provider for backtest benchmarks and test suites.

---

## Solana Protocol Parsers (`packages/providers/src/solana/parsers/`)
- **`PumpFunParser`**: Recognizes Pump.fun instructions (`create`, `buy`, `sell`, and `complete` / graduation).
- **`RaydiumParser`**: Recognizes Raydium AMM v4, CPMM, and CLMM instructions (pool initialization, swaps, liquidity additions/removals).
- **`MeteoraParser`**: Recognizes Meteora DLMM and Dynamic Pools (pair initialization and swaps).

---

## Resilience & Health Tracking
Each provider integrates:
1. **Health State Machine**: `HEALTHY`, `DEGRADED`, `DOWN`, `RATE_LIMITED`.
2. **Exponential Backoff Retry**: Automatic bounded retries with jitter for transient errors (`withRetry`).
3. **Graceful Degradation**: Enrichment provider outages do not crash the on-chain canonical pipeline.
