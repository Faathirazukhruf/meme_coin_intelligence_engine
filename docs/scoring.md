# Scoring & Decision Engine Architecture (Phase 5)

## Overview
The Meme Coin Intelligence Engine implements a **Math-First, Risk-Adjusted Scoring System** designed with strict invariants, explainability, zero look-ahead bias, and a zero-tolerance Hard Veto safety layer.

---

## 1. Hard Veto Layer (`HardVetoEngine`)
The Hard Veto Layer has absolute priority over all score calculations. If any critical safety failure is detected, the token is unconditionally classified as `Decision = IGNORE`.

### Hard Veto Conditions:
1. **Honeypot / Malicious Contract**: Bytecode or simulation indicates tokens cannot be sold.
2. **Excessive Unsellable Tax**: Buy or sell tax > 15%.
3. **Blacklist / Freeze Authority**: Mint or freeze authorities active with suspicious controls.
4. **Drained Liquidity**: Available pool liquidity < \$500 USD.
5. **Insufficient Data Quality**: Data quality completeness/reliability score < 20.

---

## 2. Quantitative Risk Engine (`RiskEngine`)
Risk is scored on a normalized scale of **0 to 100** (where higher = more dangerous):

$$\text{TotalRiskScore} = \sum_{i} w_i \cdot \text{Risk}_i$$

- **Liquidity Risk (20%)**: Depth, pool volatility, and runway.
- **Holder Concentration Risk (15%)**: Top 10 and Top 20 holder percentage.
- **Developer / Creator Risk (20%)**: Creator supply percentage, dev sell pressure.
- **Wallet / Cluster Risk (20%)**: Co-funding clusters and early sniper concentrations.
- **Market Structure Risk (15%)**: Price drawdown severity, order book imbalance.
- **Contract Risk (10%)**: Authority risks, tax, and upgradeability.

---

## 3. Opportunity Momentum Engine (`OpportunityEngine`)
Opportunity is scored on a scale of **0 to 100** (higher = stronger genuine momentum):

- **Market Momentum (20%)**: Short-term returns ($T_{1m}, T_{3m}, T_{5m}$).
- **Volume Momentum (20%)**: Volume velocity, buy pressure, buy/sell imbalance.
- **Liquidity Growth (15%)**: Liquidity growth velocity and pool stability.
- **Holder Growth (15%)**: Net organic holder velocity and acceleration.
- **Social Momentum (15%)**: Distinct author velocity and engagement.
- **Narrative Alignment (15%)**: Emerging cluster and theme velocity.

---

## 4. Confidence Engine (`ConfidenceEngine`)
Evaluates signal statistical reliability ($0 - 100$) factoring in:
- Snapshot completeness ($C \ge 80\%$)
- Trade sample count ($N \ge 20$ trades)
- Time in observation window ($\Delta t \ge 300\text{s}$)
- Multi-source provider agreement

---

## 5. Decision & Classification Engine (`DecisionEngine`)
Computes the final risk-adjusted score:

$$\text{RiskMultiplier} = \max\left(0, 1 - \frac{\text{TotalRiskScore}}{100}\right)$$

$$\text{FinalScore} = \text{OpportunityScore} \times \text{RiskMultiplier}$$

### Decision Classifications:
1. **`PAPER_TRADE_CANDIDATE`**: $\text{FinalScore} \ge 75$, $\text{Risk} \le 35$, $\text{Confidence} \ge 75$.
2. **`HIGH_PRIORITY`**: $\text{FinalScore} \ge 70$, $\text{Risk} \le 40$, $\text{Confidence} \ge 60$.
3. **`ALERT`**: $\text{FinalScore} \ge 60$, $\text{Risk} \le 55$, $\text{Confidence} \ge 60$.
4. **`WATCH`**: $\text{FinalScore} \ge 40$.
5. **`IGNORE`**: Sub-threshold score, high risk, low confidence, or hard veto.
