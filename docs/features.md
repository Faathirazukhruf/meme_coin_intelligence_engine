# Feature Engine V1 Specifications

Features are deterministic mathematical transformations computed from immutable historical snapshots and trade ledgers.

## Anti-Look-Ahead Rule (Hard Invariant)
For any feature calculation at anchor timestamp $T_0$, all inputs must strictly satisfy:
$$\text{timestamp} \le T_0$$
Any input timestamp where $\text{timestamp} > T_0$ causes an immediate `AntiLookAheadViolationError`.

---

## Core Feature Groups (PRD Section 11 & 16)

### 1. Market Features (`MarketFeatureGroup`)
- **`priceReturn1m/3m/5m/10m`**: Percentage price return over fixed rolling windows $R = \frac{P_{T0} - P_{T0-w}}{P_{T0-w}}$.
- **`marketRegime`**: Classified regime (`TRENDING_UP`, `TRENDING_DOWN`, `CONSOLIDATING`).

### 2. Volume Features (`VolumeFeatureGroup`)
- **`volume1m/5m`**: Rolling traded quote volume.
- **`volumeVelocity1m/5m`**: Rate of volume change $\frac{V_t - V_{t-w}}{w}$.
- **`volumeAcceleration`**: Acceleration of volume growth $\text{Vel}_t - \text{Vel}_{t-w}$.
- **`volumeLiquidityRatio`**: Ratio of 5-minute volume to current pool liquidity.
- **`buyPressure`**: $\frac{\text{BuyVolume}}{\text{BuyVolume} + \text{SellVolume}} \in [0, 1]$.
- **`buySellImbalance`**: $\frac{\text{BuyVolume} - \text{SellVolume}}{\text{BuyVolume} + \text{SellVolume}} \in [-1, 1]$.

### 3. Liquidity Features (`LiquidityFeatureGroup`)
- **`liquidity`**: Current pool liquidity in USD.
- **`liquidityGrowth1m/5m`**: Percentage growth in liquidity.
- **`liquidityMarketcapRatio`**: Liquidity-to-Market-Cap ratio.
- **`liquidityVolatility`**: Fluctuation intensity of pool reserves.

### 4. Holder Features (`HolderFeatureGroup`)
- **`holderCount`**: Total unique wallet holders.
- **`holderGrowth1m/5m`**: Rate of new holder acquisition.
- **`holderVelocity & holderAcceleration`**: Speed and acceleration of holder onboarding.
- **`top10Concentration & top20Concentration`**: Cumulative circulating supply held by top accounts.

### 5. Wallet & Dev Features (`WalletDevFeatureGroup`)
- **`creatorRatio`**: Percentage of circulating supply in creator/dev-linked wallets.
- **`devSellPressure`**: Ratio of dev sales relative to initial allocations.
- **`clusterConcentration & earlyWalletConcentration`**: Coordinated cluster holdings.

### 6. Social Features (`SocialFeatureGroup`)
- **`mentionCount & uniqueAuthors`**: Raw attention volume and unique contributor breadth.
- **`mentionVelocity & authorVelocity`**: Attention surge velocity.
- **`uniqueAuthorRatio`**: Ratio of unique authors to total mentions.

### 7. Narrative Features (`NarrativeFeatureGroup`)
- **`narrativeMentions & narrativeVelocity`**: Sector and meme theme trend metrics.
- **`tokenNarrativeAlignment`**: Mathematical association score between token and active market narrative.

---

## Feature Versioning
All computed feature snapshots are tagged with `feature_version` (`feature_v1`) to guarantee 100% reproducibility in backtesting.
