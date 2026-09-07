# Quantitative Backtesting Framework (Phase 8)

## Overview
Phase 8 implements the **Deterministic Backtesting Framework & Parameter Sweep Engine** (PRD Section 17, 20 & 21). It enables reproducible historical simulations of discovery strategies with realistic market friction, complete version manifests, and strict anti-look-ahead enforcement.

---

## 1. Backtest Engine Architecture (`packages/core/src/backtest/`)
- **`BacktestEngine`**:
  - Replays historical signals and forward outcome price timelines across defined date ranges.
  - Applies strategy entry filters (Min Final Score, Max Risk Score, Min Confidence Score, Allowed Decision categories).
  - Simulates realistic entry with slippage and network latency.
  - Applies Take-Profit (TP) and Stop-Loss (SL) exit triggers based on MFE and MAE excursion boundaries.
- **Reproducible Version Manifest**:
  - Automatically records `datasetVersion`, `featureVersion`, `riskVersion`, `opportunityVersion`, `scoringVersion`, `decisionVersion`, `strategyVersion`, and `codeVersion` (Git SHA).
- **`BacktestMetricsCalculator`**:
  - Computes complete quantitative metrics:
    - Total Trades & Signals
    - Win Rate (%)
    - Profit Factor ($\frac{\sum \text{Gross Gains}}{\sum \text{Gross Losses}}$)
    - Average Return per Trade (%)
    - Total Cumulative Return (%)
    - Max Drawdown (MDD %) from peak equity
    - Sharpe Ratio ($S = \frac{\bar{R} - R_f}{\sigma_R}$)
    - Sortino Ratio ($S_d = \frac{\bar{R} - R_f}{\sigma_{\text{downside}}}$)
    - Average MFE (%) and Average MAE (%)
- **`ParameterSweepEngine`**:
  - Grid search across score thresholds ($[65, 70, 75, 80]$) $\times$ risk thresholds ($[25, 35, 45]$) $\times$ horizons ($[1\text{m}, 5\text{m}, 30\text{m}, 1\text{h}]$) to produce performance ranking matrices sorted by Sharpe ratio.

---

## 2. API Endpoints (`apps/api/src/routes/api/v1/backtest.ts`)
- `GET /api/v1/backtest`: List historical backtest runs.
- `GET /api/v1/backtest/:id`: Detailed backtest report with simulated trade signals and metrics.
- `POST /api/v1/backtest/run`: Run on-demand backtest simulation across database records.
