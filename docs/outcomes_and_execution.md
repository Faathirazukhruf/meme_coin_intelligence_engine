# Forward Outcome Tracking & Paper Execution Simulation Architecture (Phase 7)

## Overview
Phase 7 introduces the **Forward Outcome Tracker** and **Simulated Paper Execution Engine** designed per PRD Section 17 & 21 to record post-signal performance, test trading strategies, and manage paper portfolios with realistic market friction.

---

## 1. Forward Outcome Tracker (`packages/core/src/outcomes/`)
- **Forward Outcome Horizons**:
  - $T+1\text{m}, T+3\text{m}, T+5\text{m}, T+10\text{m}, T+30\text{m}, T+1\text{h}, T+6\text{h}, T+24\text{h}$.
  - Percentage Return: $R_{\Delta t} = \frac{P_{T+\Delta t} - P_{T_0}}{P_{T_0}} \times 100\%$.
- **MFE & MAE Metrics**:
  - **Maximum Favorable Excursion (MFE)**: $\max\left(0, \max_t \frac{P_t - P_0}{P_0} \times 100\right)$ (measures peak available profit).
  - **Maximum Adverse Excursion (MAE)**: $\min\left(0, \min_t \frac{P_t - P_0}{P_0} \times 100\right)$ (measures maximum drawdown before exit).
  - `timeToPeakSec` and `timeToDrawdownSec`.
- **Liquidity Shift & Rug Tracker**:
  - Measures pool liquidity change % to flag post-signal liquidity drainage / rugs.

---

## 2. Simulated Paper Execution Engine (`packages/core/src/execution/`)
- **`SlippageModel`**:
  - AMM Constant-Product / DLMM Price Impact: $\text{PriceImpact} \approx \frac{\text{TradeSize}}{2 \times \text{Liquidity}}$.
  - Excessive slippage detection (> 5% price impact or > 5% pool depth).
  - Buy fill: $P_{\text{fill}} = P_{\text{market}} \times (1 + \text{Slippage})$.
  - Sell fill: $P_{\text{fill}} = P_{\text{market}} \times (1 - \text{Slippage})$.
- **`ExecutionSimulator`**:
  - Models realistic network latency (e.g. 500ms - 2000ms Solana slot confirmation delay).
  - Accounts for DEX swap fees (0.25% - 1.0%), Solana network base fee, and dynamic priority fees.
- **`PositionSizer`**:
  - Calculates risk-adjusted trade allocation:
    $$\text{Size} = \text{BaseAllocation} \times \left(\frac{\text{FinalScore}}{100}\right) \times \left(\frac{\text{Confidence}}{100}\right) \times \left(1 - \frac{\text{Risk}}{100}\right)$$
  - Enforces pool liquidity cap (max 1% of pool size per order).
- **`PaperPortfolioManager`**:
  - Tracks open paper trades, closed positions, cash balance, and equity.
  - Automatic evaluation of Take-Profit (+50%) and Stop-Loss (-15%) triggers.

---

## 3. Worker Jobs & API Endpoints
- **Worker Jobs**:
  - `OutcomeJob`: Periodically checks signals in the last 24 hours to record forward horizon returns and MFE/MAE.
  - `PaperTradeJob`: Periodically monitors open paper positions against latest market prices for automated SL/TP executions.
- **API Endpoints**:
  - `GET /api/v1/outcomes`: Query recorded outcomes with filter by token or signal.
  - `GET /api/v1/outcomes/stats`: Aggregate win rates and MFE/MAE distribution.
  - `POST /api/v1/outcomes/track`: On-demand signal outcome evaluation.
  - `GET /api/v1/paper-trading/portfolio`: Portfolio balance, equity, and performance KPIs.
  - `GET /api/v1/paper-trading/positions`: Open and closed paper trading positions.
  - `POST /api/v1/paper-trading/order`: Open a paper trade.
  - `POST /api/v1/paper-trading/close/:id`: Manually close an active position.
