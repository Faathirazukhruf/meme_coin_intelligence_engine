import { FeatureVector, OpportunityBreakdown } from '@meme-coin/types';
import { OpportunityWeightsConfig, DEFAULT_OPPORTUNITY_WEIGHTS } from '@meme-coin/config';
import { normalizeMinMax } from '@meme-coin/math';

export interface OpportunityComputationContext {
  features: FeatureVector;
  weights?: OpportunityWeightsConfig;
}

export class OpportunityEngine {
  /**
   * Computes multi-component quantitative opportunity/momentum score in [0, 100] (PRD Section 20).
   * Higher = stronger positive momentum & setup.
   */
  static computeOpportunity(ctx: OpportunityComputationContext): OpportunityBreakdown {
    const feat = ctx.features;
    const weights = ctx.weights || DEFAULT_OPPORTUNITY_WEIGHTS;

    // 1. Market Momentum (0-100)
    let marketMomentum = 50;
    if (feat.market.priceReturn1m > 0.02) marketMomentum += 15;
    if (feat.market.priceReturn5m > 0.05) marketMomentum += 20;
    if (feat.market.marketRegime === 'TRENDING_UP') marketMomentum += 15;
    if (feat.market.priceReturn5m < -0.05) marketMomentum -= 30;
    marketMomentum = normalizeMinMax(marketMomentum, 0, 100, 0, 100);

    // 2. Volume Momentum (0-100)
    let volumeMomentum = 50;
    if (feat.volume.buyPressure > 0.6) volumeMomentum += 25;
    if (feat.volume.volumeVelocity1m > 0) volumeMomentum += 15;
    if (feat.volume.volumeAcceleration > 0) volumeMomentum += 10;
    if (feat.volume.buyPressure < 0.4) volumeMomentum -= 25;
    volumeMomentum = normalizeMinMax(volumeMomentum, 0, 100, 0, 100);

    // 3. Liquidity Momentum (0-100)
    let liquidityMomentum = 50;
    if (feat.liquidity.liquidityGrowth1m > 0.05) liquidityMomentum += 25;
    if (feat.liquidity.liquidityGrowth5m > 0.1) liquidityMomentum += 25;
    if (feat.liquidity.liquidityGrowth5m < -0.05) liquidityMomentum -= 30;
    liquidityMomentum = normalizeMinMax(liquidityMomentum, 0, 100, 0, 100);

    // 4. Holder Momentum (0-100)
    let holderMomentum = 50;
    if (feat.holder.holderGrowth1m > 0.02) holderMomentum += 20;
    if (feat.holder.holderVelocity > 2) holderMomentum += 20;
    if (feat.holder.holderAcceleration > 0) holderMomentum += 10;
    holderMomentum = normalizeMinMax(holderMomentum, 0, 100, 0, 100);

    // 5. Social Momentum (0-100)
    let socialMomentum = 50;
    if (feat.social.mentionVelocity > 1) socialMomentum += 20;
    if (feat.social.uniqueAuthorRatio > 0.6) socialMomentum += 15;
    if (feat.social.engagementVelocity > 10) socialMomentum += 15;
    socialMomentum = normalizeMinMax(socialMomentum, 0, 100, 0, 100);

    // 6. Narrative Momentum (0-100)
    let narrativeMomentum = 50;
    if (feat.narrative.narrativeVelocity > 0) narrativeMomentum += 20;
    if (feat.narrative.tokenNarrativeAlignment > 0.6) narrativeMomentum += 30;
    narrativeMomentum = normalizeMinMax(narrativeMomentum, 0, 100, 0, 100);

    // Weighted composite opportunity calculation
    const totalOpportunityScore =
      marketMomentum * weights.marketMomentum +
      volumeMomentum * weights.volumeMomentum +
      liquidityMomentum * weights.liquidityMomentum +
      holderMomentum * weights.holderMomentum +
      socialMomentum * weights.socialMomentum +
      narrativeMomentum * weights.narrativeMomentum;

    return {
      marketMomentum,
      volumeMomentum,
      liquidityMomentum,
      holderMomentum,
      socialMomentum,
      narrativeMomentum,
      totalOpportunityScore: normalizeMinMax(totalOpportunityScore, 0, 100, 0, 100),
    };
  }
}
