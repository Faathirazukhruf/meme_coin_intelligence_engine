import { CanonicalEventType } from './events.js';

export type ProviderHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'RATE_LIMITED';

export interface ProviderHealthReport {
  providerName: string;
  status: ProviderHealthStatus;
  latencyMs: number;
  lastCheckedAt: Date;
  consecutiveFailures: number;
  rateLimitRemaining?: number;
  rateLimitResetAt?: Date;
  details?: Record<string, unknown>;
}

export interface RawEventPayload {
  source: string;
  endpoint: string;
  receivedAt: Date;
  payload: string;
  payloadHash: string;
}

export interface IngestedTransaction {
  chainId: string;
  signature: string;
  slot?: bigint | number;
  blockTime?: Date;
  success: boolean;
  rawPayloadId?: string;
  instructions: unknown[];
}

export interface IngestedTokenMetadata {
  chainId: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  creatorAddress?: string;
  uri?: string;
}

export interface IngestedMarketOverview {
  chainId: string;
  tokenAddress: string;
  priceUsd: number;
  liquidityUsd: number;
  fdvUsd: number;
  volume24hUsd: number;
  timestamp: Date;
}

export interface ChainProvider {
  readonly name: string;
  getHealth(): Promise<ProviderHealthReport>;
  getTokenMetadata(address: string): Promise<IngestedTokenMetadata | null>;
  getTransaction(signature: string): Promise<IngestedTransaction | null>;
  subscribeEvents?(handler: (eventType: CanonicalEventType, data: unknown) => Promise<void>): Promise<void>;
}

export interface MarketProvider {
  readonly name: string;
  getHealth(): Promise<ProviderHealthReport>;
  getTokenMarket(address: string): Promise<IngestedMarketOverview | null>;
  getOHLCV(address: string, resolution: string, from: Date, to: Date): Promise<unknown[]>;
}

export interface SocialProvider {
  readonly name: string;
  getHealth(): Promise<ProviderHealthReport>;
  searchMentions(query: string, since: Date): Promise<unknown[]>;
}

export interface NewsProvider {
  readonly name: string;
  getHealth(): Promise<ProviderHealthReport>;
  searchNews(query: string, since: Date): Promise<unknown[]>;
}
