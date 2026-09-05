import { CanonicalEventType } from './events.js';

export type ChainId = 'solana' | 'ethereum' | 'base' | string;

export interface TokenEntity {
  id: string;
  chainId: ChainId;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  creatorAddress?: string | null;
  createdAt: Date;
  firstSeenAt: Date;
  firstLiquidityAt?: Date | null;
  firstTradeAt?: Date | null;
  status: 'active' | 'graduated' | 'dead' | 'vetoed';
  createdSource?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PoolEntity {
  id: string;
  tokenId: string;
  chainId: ChainId;
  dex: string;
  protocol: string;
  poolAddress: string;
  baseToken: string;
  quoteToken: string;
  createdAt: Date;
  firstLiquidityAt?: Date | null;
  status: 'active' | 'inactive' | 'drained';
  metadata?: Record<string, unknown> | null;
}

export type TradeSide = 'BUY' | 'SELL';

export interface TradeEntity {
  id: string;
  tokenId: string;
  poolId: string;
  chainId: ChainId;
  eventTime: Date;
  ingestedAt: Date;
  transactionHash: string;
  eventIndex: number;
  instructionIndex?: number | null;
  innerInstructionIndex?: number | null;
  side: TradeSide;
  price: number;
  baseAmount: number;
  quoteAmount: number;
  buyer?: string | null;
  seller?: string | null;
  liquidityBefore?: number | null;
  liquidityAfter?: number | null;
  rawDataId?: string | null;
  parserVersion: string;
}

export interface LiquidityEventEntity {
  id: string;
  tokenId: string;
  poolId: string;
  eventType: 'ADD' | 'REMOVE' | 'MIGRATE';
  eventTime: Date;
  amount: number;
  liquidityBefore?: number | null;
  liquidityAfter?: number | null;
  transactionHash: string;
  rawDataId?: string | null;
  parserVersion: string;
}

export interface CanonicalEventRecord {
  id: string;
  tokenId?: string | null;
  eventType: CanonicalEventType;
  source: string;
  eventTime: Date;
  ingestedAt: Date;
  processedAt?: Date | null;
  slot?: bigint | number | null;
  transactionHash?: string | null;
  eventIndex?: number | null;
  walletAddress?: string | null;
  amount?: number | null;
  price?: number | null;
  liquidity?: number | null;
  rawDataId?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface RawDataRecord {
  id: string;
  source: string;
  endpoint: string;
  receivedAt: Date;
  payload: string; // JSON or serialized payload
  payloadHash: string;
}

export interface WalletEntity {
  id: string;
  chainId: ChainId;
  address: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  walletType?: 'CREATOR' | 'SNIPER' | 'INSIDER' | 'WHALE' | 'RETAIL' | 'UNKNOWN' | null;
  classificationConfidence?: number | null;
}

export interface WalletRelationshipEntity {
  id: string;
  walletA: string;
  walletB: string;
  relationshipType: 'FUNDED_BY' | 'TRANSFERRED_TO' | 'SAME_CLUSTER' | 'RELATED_TO_CREATOR';
  detectedAt: Date;
  confidence: number;
  evidence: Record<string, unknown>;
}

export interface MarketSnapshotEntity {
  id: string;
  tokenId: string;
  poolId?: string | null;
  timestamp: Date;
  price: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  volume1m: number;
  volume5m: number;
  volume15m: number;
  buyVolume: number;
  sellVolume: number;
  buyCount: number;
  sellCount: number;
  txCount: number;
  dataQuality: number; // 0-100 completeness score
}

export interface HolderSnapshotEntity {
  id: string;
  tokenId: string;
  timestamp: Date;
  holderCount: number;
  top10Concentration: number;
  top20Concentration: number;
  top50Concentration: number;
  creatorRatio: number;
  dataQuality: number;
}

export interface SocialSnapshotEntity {
  id: string;
  tokenId: string;
  timestamp: Date;
  mentionCount: number;
  uniqueAuthors: number;
  engagement: number;
  authorGrowth: number;
  mentionVelocity: number;
  engagementVelocity: number;
  dataCompleteness: number;
}
