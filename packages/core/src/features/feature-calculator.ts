import {
  MarketSnapshotEntity,
  HolderSnapshotEntity,
  SocialSnapshotEntity,
  MarketFeatureGroup,
  VolumeFeatureGroup,
  LiquidityFeatureGroup,
  HolderFeatureGroup,
  WalletDevFeatureGroup,
  SocialFeatureGroup,
  NarrativeFeatureGroup,
  FeatureVector,
} from '@meme-coin/types';
import {
  calculateReturn,
  calculateBuyPressure,
  calculateBuySellImbalance,
  calculateVolumeVelocity,
  calculateVolumeAcceleration,
  calculateVolumeLiquidityRatio,
  calculateGrowth,
  calculateVelocity,
  calculateAcceleration,
} from '@meme-coin/math';

export interface HistoricalSnapshotsContext {
  currentMarket: MarketSnapshotEntity;
  market1m?: MarketSnapshotEntity;
  market3m?: MarketSnapshotEntity;
  market5m?: MarketSnapshotEntity;
  market10m?: MarketSnapshotEntity;

  currentHolder: HolderSnapshotEntity;
  holder1m?: HolderSnapshotEntity;
  holder5m?: HolderSnapshotEntity;

  currentSocial: SocialSnapshotEntity;
  socialPrev?: SocialSnapshotEntity;

  walletExtra?: {
    clusterConcentration?: number;
    earlyWalletConcentration?: number;
    creatorActivity?: number;
  };

  narrativeExtra?: {
    narrativeMentions?: number;
    narrativeVelocity?: number;
    narrativeAcceleration?: number;
    tokenNarrativeAlignment?: number;
  };
}

export class FeatureCalculator {
  static computeMarketFeatures(ctx: HistoricalSnapshotsContext): MarketFeatureGroup {
    const curP = ctx.currentMarket.price;
    const p1m = ctx.market1m?.price ?? curP;
    const p3m = ctx.market3m?.price ?? curP;
    const p5m = ctx.market5m?.price ?? curP;
    const p10m = ctx.market10m?.price ?? curP;

    const r1m = calculateReturn(curP, p1m);
    const r3m = calculateReturn(curP, p3m);
    const r5m = calculateReturn(curP, p5m);
    const r10m = calculateReturn(curP, p10m);

    let regime: 'TRENDING_UP' | 'TRENDING_DOWN' | 'CONSOLIDATING' = 'CONSOLIDATING';
    if (r5m > 0.05 && r1m >= 0) regime = 'TRENDING_UP';
    else if (r5m < -0.05 && r1m <= 0) regime = 'TRENDING_DOWN';

    return {
      priceReturn1m: r1m,
      priceReturn3m: r3m,
      priceReturn5m: r5m,
      priceReturn10m: r10m,
      marketRegime: regime,
    };
  }

  static computeVolumeFeatures(ctx: HistoricalSnapshotsContext): VolumeFeatureGroup {
    const curM = ctx.currentMarket;
    const prevM1m = ctx.market1m;
    const prevM5m = ctx.market5m;

    const v1m = curM.volume1m;
    const v5m = curM.volume5m;

    const vVel1m = prevM1m ? calculateVolumeVelocity(v1m, prevM1m.volume1m, 1) : 0;
    const vVel5m = prevM5m ? calculateVolumeVelocity(v5m, prevM5m.volume5m, 5) : 0;
    const vAccel = calculateVolumeAcceleration(vVel1m, vVel5m);
    const vLiqRatio = calculateVolumeLiquidityRatio(v5m, curM.liquidity);
    const buyPressure = calculateBuyPressure(curM.buyVolume, curM.sellVolume);
    const buySellImbalance = calculateBuySellImbalance(curM.buyVolume, curM.sellVolume);

    return {
      volume1m: v1m,
      volume5m: v5m,
      volumeVelocity1m: vVel1m,
      volumeVelocity5m: vVel5m,
      volumeAcceleration: vAccel,
      volumeLiquidityRatio: vLiqRatio,
      buyPressure,
      buySellImbalance,
    };
  }

  static computeLiquidityFeatures(ctx: HistoricalSnapshotsContext): LiquidityFeatureGroup {
    const curM = ctx.currentMarket;
    const liq1m = ctx.market1m?.liquidity ?? curM.liquidity;
    const liq5m = ctx.market5m?.liquidity ?? curM.liquidity;

    const liqGrowth1m = calculateGrowth(curM.liquidity, liq1m);
    const liqGrowth5m = calculateGrowth(curM.liquidity, liq5m);
    const liqMcRatio = curM.marketCap > 0 ? curM.liquidity / curM.marketCap : 0;
    const liqVolatility = Math.abs(liqGrowth1m - liqGrowth5m);

    return {
      liquidity: curM.liquidity,
      liquidityGrowth1m: liqGrowth1m,
      liquidityGrowth5m: liqGrowth5m,
      liquidityMarketcapRatio: liqMcRatio,
      liquidityVolatility: liqVolatility,
    };
  }

  static computeHolderFeatures(ctx: HistoricalSnapshotsContext): HolderFeatureGroup {
    const curH = ctx.currentHolder;
    const prevH1m = ctx.holder1m;
    const prevH5m = ctx.holder5m;

    const hCount = curH.holderCount;
    const h1m = prevH1m?.holderCount ?? hCount;
    const h5m = prevH5m?.holderCount ?? hCount;

    const hGrowth1m = calculateGrowth(hCount, h1m);
    const hGrowth5m = calculateGrowth(hCount, h5m);
    const hVel = calculateVelocity(hCount, h1m, 1);
    const hPrevVel = calculateVelocity(h1m, h5m, 4);
    const hAccel = calculateAcceleration(hVel, hPrevVel);

    return {
      holderCount: hCount,
      holderGrowth1m: hGrowth1m,
      holderGrowth5m: hGrowth5m,
      holderVelocity: hVel,
      holderAcceleration: hAccel,
      top10Concentration: curH.top10Concentration,
      top20Concentration: curH.top20Concentration,
    };
  }

  static computeWalletDevFeatures(ctx: HistoricalSnapshotsContext): WalletDevFeatureGroup {
    const curH = ctx.currentHolder;
    const extra = ctx.walletExtra || {};

    return {
      creatorRatio: curH.creatorRatio,
      devSellPressure: curH.creatorRatio > 0.3 ? 0.8 : 0.1,
      creatorActivity: extra.creatorActivity ?? 1,
      clusterConcentration: extra.clusterConcentration ?? 0.15,
      earlyWalletConcentration: extra.earlyWalletConcentration ?? 0.2,
    };
  }

  static computeSocialFeatures(ctx: HistoricalSnapshotsContext): SocialFeatureGroup {
    const curS = ctx.currentSocial;
    const uniqueRatio = curS.mentionCount > 0 ? Math.min(1, curS.uniqueAuthors / curS.mentionCount) : 1;

    return {
      mentionCount: curS.mentionCount,
      uniqueAuthors: curS.uniqueAuthors,
      mentionVelocity: curS.mentionVelocity,
      authorVelocity: curS.authorGrowth,
      uniqueAuthorRatio: uniqueRatio,
      engagementVelocity: curS.engagementVelocity,
    };
  }

  static computeNarrativeFeatures(ctx: HistoricalSnapshotsContext): NarrativeFeatureGroup {
    const extra = ctx.narrativeExtra || {};
    return {
      narrativeMentions: extra.narrativeMentions ?? 0,
      narrativeVelocity: extra.narrativeVelocity ?? 0,
      narrativeAcceleration: extra.narrativeAcceleration ?? 0,
      tokenNarrativeAlignment: extra.tokenNarrativeAlignment ?? 0.5,
    };
  }

  static computeAll(ctx: HistoricalSnapshotsContext): FeatureVector {
    return {
      market: this.computeMarketFeatures(ctx),
      volume: this.computeVolumeFeatures(ctx),
      liquidity: this.computeLiquidityFeatures(ctx),
      holder: this.computeHolderFeatures(ctx),
      walletDev: this.computeWalletDevFeatures(ctx),
      social: this.computeSocialFeatures(ctx),
      narrative: this.computeNarrativeFeatures(ctx),
    };
  }
}
