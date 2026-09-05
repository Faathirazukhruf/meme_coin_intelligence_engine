# Canonical Data Model

The data model is designed to support multi-chain readiness while being Solana-first in V1.

## Primary Entities

| Table | Purpose | Key Identifier |
|---|---|---|
| `tokens` | Core asset entity | `address` (e.g. mint address on Solana) |
| `pools` | Liquidity venues (Raydium, Pump, Orca, Meteora) | `pool_address` |
| `trades` | Deduplicated canonical trade ledger | `(chain_id, transaction_hash, event_index)` |
| `liquidity_events` | Liquidity additions, removals, migrations | `(pool_id, transaction_hash)` |
| `events` | Generic event stream ledger | `id` |
| `raw_data` | Immutable raw provider payloads | `payload_hash` |
| `wallets` | Discovered wallet profiles & classifications | `address` |
| `wallet_relationships` | Cluster & funding link evidence | `(wallet_a, wallet_b, relationship_type)` |
| `market_snapshots` | Periodic market metrics (price, vol, liq) | `(token_id, timestamp)` |
| `holder_snapshots` | Periodic holder counts & concentration | `(token_id, timestamp)` |
| `feature_snapshots` | Versioned derived feature vectors | `(token_id, timestamp)` |
| `score_snapshots` | Risk, Opportunity, and Final scores | `(token_id, timestamp)` |
| `signals` | Actionable engine alerts with plain text reasoning | `id` |
| `outcomes` | Forward horizon tracking ($T+1m$ to $T+24h$, MFE/MAE) | `(token_id, anchor_timestamp)` |
| `backtests` | Versioned reproducible backtest experiments | `id` |
