# Historical Optimization & Evidence-Based Tuning (Phase 10)

## Overview
Phase 10 implements the **Continuous Calibration, Feature Importance & Regime Adaptation Layer** (PRD Section 18-20, 24). It provides statistical rigor, predictive power evaluation, and distribution drift protection.

---

## 1. Information Coefficient (IC) & Feature Importance (`InformationCoefficientAnalyzer`)
- **Metric**: Spearman Rank Information Coefficient ($\text{IC}$) and Pearson Correlation between feature values at $T_0$ and forward returns at $T+\Delta t$:
  $$\text{IC} = \text{Corr}\left(\text{Feature}(T_0), \text{Return}(T_0 \to T+\Delta t)\right)$$
- **Predictive Strength Classification**:
  - `STRONG`: $|\text{IC}| \ge 0.15$
  - `MODERATE`: $0.08 \le |\text{IC}| < 0.15$
  - `WEAK`: $0.03 \le |\text{IC}| < 0.08$
  - `NO_SIGNAL`: $|\text{IC}| < 0.03$

---

## 2. Walk-Forward Weight Optimizer (`WeightOptimizer`)
- Dynamically calibrates Opportunity component weights ($w_{\text{mkt}}, w_{\text{vol}}, w_{\text{liq}}, w_{\text{holder}}, w_{\text{soc}}, w_{\text{nar}}$) based on empirical IC ranking.
- Enforces strict minimum floor weights ($0.05$) and maximum caps ($0.35$) to prevent overfitting.
- Calibrates Risk component weights according to historical rug cause distributions.

---

## 3. Data Drift & Market Regime Shift Detector (`DriftDetector`)
- Compares rolling feature distributions against baseline references.
- Identifies Solana Memecoin Market Regimes:
  - `TRENDING_UP`: High buy pressure ($> 0.60$), rising volume velocity $\to$ standard discovery rules.
  - `HIGH_VOLATILITY`: Erratic volume spikes $\to$ widen slippage buffer, scale down position sizing.
  - `CHOPPY`: Flat volume and low returns $\to$ filter strictly for Paper Trade Candidates.
  - `MARKET_DRAWDOWN`: Heavy sell pressure and volume contraction $\to$ tighten stop-loss, raise minimum final score.

---

## 4. API Endpoints (`apps/api/src/routes/api/v1/optimization.ts`)
- `GET /api/v1/optimization/ic`: Feature importance and Spearman rank IC ranking.
- `GET /api/v1/optimization/weights`: Recommended empirical risk and opportunity weights.
- `GET /api/v1/optimization/regime`: Real-time market regime assessment and drift reports.
