# Feature Engine V1 Specifications

Features are deterministic mathematical transformations over canonical trade ledgers and immutable snapshots.

## Core Feature Groups & Mathematical Formulas

### 1. Market Features
- **Price Return**: $R_t = \frac{P_t - P_{t-w}}{P_{t-w}}$ (calculated for windows $1m, 3m, 5m, 10m$).
- **Log Return**: $\ln(P_t / P_{t-w})$.

### 2. Volume & Order Flow
- **Buy Pressure**: $\frac{\text{BuyVolume}}{\text{BuyVolume} + \text{SellVolume}} \in [0, 1]$.
- **Order Imbalance**: $\frac{\text{BuyVolume} - \text{SellVolume}}{\text{BuyVolume} + \text{SellVolume}} \in [-1, 1]$.
- **Volume Velocity**: $\frac{\text{Volume}_t - \text{Volume}_{t-w}}{w}$.
- **Volume Acceleration**: $\text{Velocity}_t - \text{Velocity}_{t-w}$.
- **Volume to Liquidity Ratio**: $\frac{\text{Volume}_t}{\text{Liquidity}_t}$.

### 3. Holder & Developer Metrics
- **Top-N Concentration**: $\frac{\sum_{i=1}^N \text{Balance}_i}{\text{CirculatingSupply}} \in [0, 1]$ (tracked for Top 10, Top 20, Top 50).
- **Creator Ratio**: $\frac{\text{CreatorTokens}}{\text{CirculatingSupply}} \in [0, 1]$.
- **Dev Sell Pressure**: $\frac{\text{DevSellVolume}}{\text{InitialAllocation}}$.
- **Holder Velocity & Acceleration**: Rate of change in unique holder count.

### 4. Normalization
- **Robust Z-Score**: $z = \frac{x - \text{median}}{\text{MAD} \times 1.4826}$.
- **Percentile Rank**: Evaluated over historical distribution.
