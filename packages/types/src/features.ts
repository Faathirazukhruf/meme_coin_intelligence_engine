export interface MarketFeatureGroup {
  priceReturn1m: number;
  priceReturn3m: number;
  priceReturn5m: number;
  priceReturn10m: number;
  marketRegime: 'TRENDING_UP' | 'TRENDING_DOWN' | 'CONSOLIDATING';
  btcSolContext?: number;
}

export interface VolumeFeatureGroup {
  volume1m: number;
  volume5m: number;
  volumeVelocity1m: number;
  volumeVelocity5m: number;
  volumeAcceleration: number;
  volumeLiquidityRatio: number;
  buyPressure: number;          // [0, 1]
  buySellImbalance: number;      // [-1, 1]
}

export interface LiquidityFeatureGroup {
  liquidity: number;
  liquidityGrowth1m: number;
  liquidityGrowth5m: number;
  liquidityMarketcapRatio: number;
  liquidityVolatility: number;
}

export interface HolderFeatureGroup {
  holderCount: number;
  holderGrowth1m: number;
  holderGrowth5m: number;
  holderVelocity: number;
  holderAcceleration: number;
  top10Concentration: number;    // [0, 1]
  top20Concentration: number;    // [0, 1]
}

export interface WalletDevFeatureGroup {
  creatorRatio: number;          // [0, 1]
  devSellPressure: number;       // [0, 1+]
  creatorActivity: number;
  clusterConcentration: number;  // [0, 1]
  earlyWalletConcentration: number; // [0, 1]
}

export interface SocialFeatureGroup {
  mentionCount: number;
  uniqueAuthors: number;
  mentionVelocity: number;
  authorVelocity: number;
  uniqueAuthorRatio: number;     // [0, 1]
  engagementVelocity: number;
}

export interface NarrativeFeatureGroup {
  narrativeMentions: number;
  narrativeVelocity: number;
  narrativeAcceleration: number;
  tokenNarrativeAlignment: number; // [0, 1]
}

export interface FeatureVector {
  market: MarketFeatureGroup;
  volume: VolumeFeatureGroup;
  liquidity: LiquidityFeatureGroup;
  holder: HolderFeatureGroup;
  walletDev: WalletDevFeatureGroup;
  social: SocialFeatureGroup;
  narrative: NarrativeFeatureGroup;
}

export interface FeatureSnapshotRecord {
  id: string;
  tokenId: string;
  timestamp: Date;
  featureVersion: string;
  features: FeatureVector;
}
