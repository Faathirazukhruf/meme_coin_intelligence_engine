import { FeatureVector, RiskBreakdown } from '@meme-coin/types';
import { RiskWeightsConfig, DEFAULT_RISK_WEIGHTS } from '@meme-coin/config';
import { normalizeMinMax } from '@meme-coin/math';

export interface RiskComputationContext {
  features: FeatureVector;
  weights?: RiskWeightsConfig;
  contractRiskScore?: number;
}

export class RiskEngine {
  /**
   * Computes multi-component quantitative risk score in [0, 100] (PRD Section 18).
   * Higher = more risky.
   */
  static computeRisk(ctx: RiskComputationContext): RiskBreakdown {
    const feat = ctx.features;
    const weights = ctx.weights || DEFAULT_RISK_WEIGHTS;

    // 1. Liquidity Risk (0-100): Penalizes low liquidity (< $10k) and volatile pools
    let liquidityRisk = 0;
    if (feat.liquidity.liquidity < 2000) liquidityRisk = 95;
    else if (feat.liquidity.liquidity < 10000) liquidityRisk = 75;
    else if (feat.liquidity.liquidity < 50000) liquidityRisk = 45;
    else liquidityRisk = 20;
    liquidityRisk += Math.min(20, feat.liquidity.liquidityVolatility * 50);
    liquidityRisk = normalizeMinMax(liquidityRisk, 0, 100, 0, 100);

    // 2. Holder Risk (0-100): High top-10 or top-20 concentration increases dump risk
    const holderRisk = normalizeMinMax(
      feat.holder.top10Concentration * 80 + feat.holder.top20Concentration * 20,
      0,
      100,
      0,
      100
    );

    // 3. Dev Risk (0-100): High creator balance and dev sell pressure
    const devRisk = normalizeMinMax(
      feat.walletDev.creatorRatio * 60 + Math.min(1, feat.walletDev.devSellPressure) * 40,
      0,
      100,
      0,
      100
    );

    // 4. Wallet Risk (0-100): Cluster & early sniper concentration
    const walletRisk = normalizeMinMax(
      feat.walletDev.clusterConcentration * 60 + feat.walletDev.earlyWalletConcentration * 40,
      0,
      100,
      0,
      100
    );

    // 5. Market Structure Risk (0-100): Heavy sell imbalance and sharp drawdowns
    let marketStructureRisk = 50;
    if (feat.volume.buySellImbalance < -0.3) marketStructureRisk += 30;
    if (feat.market.priceReturn5m < -0.1) marketStructureRisk += 20;
    if (feat.volume.buyPressure > 0.6) marketStructureRisk -= 20;
    marketStructureRisk = normalizeMinMax(marketStructureRisk, 0, 100, 0, 100);

    // 6. Contract Risk (0-100)
    const contractRisk = ctx.contractRiskScore ?? 25;

    // Weighted composite risk calculation
    const totalRiskScore =
      liquidityRisk * weights.liquidityRisk +
      holderRisk * weights.holderRisk +
      devRisk * weights.devRisk +
      walletRisk * weights.walletRisk +
      marketStructureRisk * weights.marketStructureRisk +
      contractRisk * weights.contractRisk;

    return {
      liquidityRisk,
      holderRisk,
      devRisk,
      walletRisk,
      marketStructureRisk,
      contractRisk,
      totalRiskScore: normalizeMinMax(totalRiskScore, 0, 100, 0, 100),
    };
  }
}
