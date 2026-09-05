# Scoring, Hard Veto & Decision Rules

## Pipeline Flow

$$\text{Hard Veto Check} \longrightarrow \text{Risk Engine} \times \text{Opportunity Engine} \longrightarrow \text{Risk-Adjusted Final Score} \longrightarrow \text{Confidence Score} \longrightarrow \text{Decision}$$

---

## 1. Hard Veto Layer
A token triggering any Hard Veto condition is immediately assigned `Decision = IGNORE`. No high opportunity score can override a hard veto.
- Honeypot / unsellable contract
- Liquidity removed or drained
- Critical contract risk
- Insufficient canonical data

---

## 2. Risk Engine (0 - 100, Higher = More Risky)
- Liquidity Risk: 20%
- Holder Risk: 15%
- Dev Risk: 20%
- Wallet Risk: 20%
- Market Structure Risk: 15%
- Contract Risk: 10%

---

## 3. Opportunity Engine (0 - 100, Higher = Better)
- Market Momentum: 20%
- Volume Momentum: 20%
- Liquidity Momentum: 15%
- Holder Momentum: 15%
- Social Momentum: 15%
- Narrative Momentum: 15%

---

## 4. Final Score & Confidence
$$\text{FinalScore} = \text{OpportunityScore} \times \text{RiskMultiplier}, \quad \text{where } \text{RiskMultiplier} \in [0, 1]$$

$$\text{Confidence} = f(\text{DataCompleteness}, \text{SourceAgreement}, \text{FeatureStability}, \text{SampleQuality})$$

---

## 5. Decision Classes
- `IGNORE`
- `WATCH`
- `ALERT`
- `HIGH_PRIORITY`
- `PAPER_TRADE_CANDIDATE`
