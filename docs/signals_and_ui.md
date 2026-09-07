# Signals, Alerts & Web Dashboard Architecture (Phase 6)

## Overview
Phase 6 implements the real-time alerting engine, notification filters, signal lifecycle management, API endpoints, and a Next.js App Router Web UI.

---

## 1. Signal & Alert Engine (`packages/core/src/signals/`)
- **`SignalFilterEngine`**:
  - Filter criteria: Minimum Final Score, Maximum Risk Score, Minimum Confidence, Allowed Decision Categories (`PAPER_TRADE_CANDIDATE`, `HIGH_PRIORITY`, `ALERT`).
  - **Cooldown & Anti-Spam Router**: Enforces token cooldowns (default 15 minutes) to prevent redundant alerts for the same token.
  - Priority Classification: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
- **`AlertDispatcher`**:
  - Event-driven publisher supporting local subscribers, WebSockets, and external Webhooks.
  - Formats rich Telegram / Discord markdown payloads containing Final Score, Risk Decomposition, Opportunity Drivers, and Deterministic Explainability notes.
- **`SignalLifecycleService`**:
  - Manages signal states: `ACTIVE`, `RESOLVED`, `EXPIRED`, `CANCELLED`.
  - Automatic expiration of stale signals (> 120 minutes).
  - Aggregated signal discovery metrics.

---

## 2. API Endpoints (`apps/api/src/routes/api/v1/`)
- `GET /api/v1/signals`: Paginated signal list with filters (`decision`, `status`, `tokenId`).
- `GET /api/v1/signals/:id`: Detailed signal with score snapshot and token metadata.
- `GET /api/v1/signals/stats`: Aggregates of active, paper trade candidates, and alerts.
- `POST /api/v1/signals/evaluate`: Trigger on-demand token scoring and signal generation.
- `POST /api/v1/alerts/webhook`: Register external webhook URL.
- `POST /api/v1/alerts/test`: Trigger test notification payload.

---

## 3. Web UI Dashboard (`apps/web`)
Built using Next.js 14 App Router, Tailwind CSS, Lucide icons:
- **`Overview Dashboard (/)`**: Live signal stream, key metrics (monitored tokens, candidate count, active signals, veto count), quantitative invariant status.
- **`Live Radar (/signals)`**: Search by symbol/address, filter tabs, interactive score slider, real-time feed cards.
- **`Token Screener (/tokens)`**: Multi-dex token screener across Pump.fun, Raydium, Meteora with 5m price change, 5m volume, liquidity, holder count, dev risk, and final scores.
- **`Token Deep Dive (/tokens/[address])`**: Multi-factor risk decomposition bar, momentum drivers, developer balance tracking, anti-look-ahead assertion badges ($t \le T_0$).
- **`Risk & Veto Inspector (/risk)`**: Instant Solana contract audit, honeypot simulation sell check, transfer tax verifier, liquidity floor guard.
- **`Backtest Studio Preview (/backtest)`**: Strategy parameter controls (Min Final Score, Max Risk, Forward Horizon $1\text{m}, 5\text{m}, 30\text{m}, 1\text{h}, 24\text{h}$), MFE/MAE distribution metrics.
