# Backtesting & Outcome Research Engine

## Anti-Bias Controls
1. **Look-Ahead Bias Elimination**: Enforced by anchor timestamp $T_0$.
2. **Survivorship Bias Control**: Dead tokens, rugs, low-volume failures remain in the dataset.
3. **Selection Bias Control**: Full discovered universe is retained.
4. **Execution Bias Separation**: Market outcomes are tracked separately from simulated Paper Execution (slippage, latency, fees).

## Forward Horizons Tracked
- $T+1m, T+3m, T+5m, T+10m, T+30m, T+1h, T+6h, T+24h$
- **MFE (Maximum Favorable Excursion)**: Peak positive return achieved in horizon.
- **MAE (Maximum Adverse Excursion)**: Maximum drawdown experienced during horizon.
