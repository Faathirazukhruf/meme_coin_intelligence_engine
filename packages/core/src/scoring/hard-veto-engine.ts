import { HardVetoResult, FeatureVector } from '@meme-coin/types';

export interface HardVetoContext {
  features: FeatureVector;
  dataQualityScore?: number;
  contractAudit?: {
    isHoneypot?: boolean;
    isMintableWithoutCap?: boolean;
    isFreezable?: boolean;
    hasTransferTaxExcessive?: boolean;
  };
}

export class HardVetoEngine {
  /**
   * Evaluates zero-tolerance hard veto rules (PRD Section 19).
   * A token triggering any veto condition is immediately marked as IGNORE.
   * High opportunity scores CANNOT override a hard veto.
   */
  static evaluateVeto(ctx: HardVetoContext): HardVetoResult {
    const audit = ctx.contractAudit || {};
    const feat = ctx.features;

    // 1. Critical Contract / Honeypot Risks
    if (audit.isHoneypot) {
      return { isVetoed: true, reason: 'HONEYPOT', details: { msg: 'Contract detected as honeypot' } };
    }

    if (audit.hasTransferTaxExcessive) {
      return { isVetoed: true, reason: 'UNSELLABLE', details: { msg: 'Excessive buy/sell tax prevents profitable exit' } };
    }

    if (audit.isFreezable) {
      return { isVetoed: true, reason: 'CRITICAL_CONTRACT_RISK', details: { msg: 'Freeze authority is enabled' } };
    }

    if (audit.isMintableWithoutCap) {
      return { isVetoed: true, reason: 'CRITICAL_CONTRACT_RISK', details: { msg: 'Uncapped mint authority retained by creator' } };
    }

    // 2. Liquidity Drained / Removed
    if (feat.liquidity.liquidity < 500) {
      return { isVetoed: true, reason: 'LIQUIDITY_REMOVED', details: { liquidity: feat.liquidity.liquidity } };
    }

    // 3. Insufficient / Corrupted Data
    if (ctx.dataQualityScore !== undefined && ctx.dataQualityScore < 20) {
      return { isVetoed: true, reason: 'INSUFFICIENT_DATA', details: { dataQualityScore: ctx.dataQualityScore } };
    }

    return { isVetoed: false };
  }
}
