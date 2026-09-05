# Provider Layer Architecture

## Provider Interfaces
Core engines do not import third-party SDKs directly. All external data providers implement canonical interfaces:
- `ChainProvider`: Solana RPC, Helius
- `MarketProvider`: Birdeye, DexScreener
- `SocialProvider`: X / Twitter
- `NewsProvider`: RSS / News Feeds

## Resilience & Health Tracking
Each provider implements:
1. **Health Tracking**: `HEALTHY`, `DEGRADED`, `DOWN`, `RATE_LIMITED`.
2. **Exponential Backoff Retry**: Automatic retry with jitter for transient failures.
3. **Graceful Degradation**: Outages in enrichment providers do not crash the pipeline.
