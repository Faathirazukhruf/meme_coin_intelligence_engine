import { MarketProvider, IngestedMarketOverview, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';
import { getConfig } from '@meme-coin/config';
import { withRetry } from '../retry/retry-helper.js';

interface BirdeyeOverviewResponse {
  data?: {
    price?: number;
    liquidity?: number;
    mc?: number;
    fdv?: number;
    v24hUSD?: number;
  };
}

interface BirdeyeOhlcvResponse {
  data?: {
    items?: unknown[];
  };
}

export class BirdeyeMarketProvider extends BaseProvider implements MarketProvider {
  private apiKey: string;
  private baseUrl = 'https://public-api.birdeye.so';

  constructor(apiKey?: string) {
    super('birdeye');
    const config = getConfig();
    this.apiKey = apiKey || config.BIRDEYE_API_KEY || '';
  }

  async getTokenMarket(address: string): Promise<IngestedMarketOverview | null> {
    if (!this.apiKey) {
      return null;
    }

    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.baseUrl}/defi/token_overview?address=${address}`, {
            headers: {
              'X-API-KEY': this.apiKey,
              'x-chain': 'solana',
            },
          });
          if (res.status === 429) {
            this.recordFailure(true);
            throw new Error('Birdeye Rate Limited');
          }
          if (!res.ok) throw new Error(`Birdeye HTTP ${res.status}`);
          return (await res.json()) as BirdeyeOverviewResponse;
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);
      const data = response?.data;
      if (!data) return null;

      return {
        chainId: 'solana',
        tokenAddress: address,
        priceUsd: data.price ?? 0,
        liquidityUsd: data.liquidity ?? 0,
        fdvUsd: data.mc ?? data.fdv ?? 0,
        volume24hUsd: data.v24hUSD ?? 0,
        timestamp: new Date(),
      };
    } catch (err) {
      this.logger.error({ err, address }, 'Failed to fetch market overview from Birdeye');
      return null;
    }
  }

  async getOHLCV(address: string, resolution: string, from: Date, to: Date): Promise<unknown[]> {
    if (!this.apiKey) return [];

    try {
      const timeFrom = Math.floor(from.getTime() / 1000);
      const timeTo = Math.floor(to.getTime() / 1000);
      const res = await fetch(
        `${this.baseUrl}/defi/ohlcv?address=${address}&type=${resolution}&time_from=${timeFrom}&time_to=${timeTo}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'x-chain': 'solana',
          },
        }
      );
      if (!res.ok) return [];
      const json = (await res.json()) as BirdeyeOhlcvResponse;
      return json?.data?.items || [];
    } catch (err) {
      this.logger.error({ err, address }, 'Failed to fetch OHLCV from Birdeye');
      return [];
    }
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    if (!this.apiKey) {
      this.recordFailure();
      return super.getHealth();
    }
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/defi/token_overview?address=So11111111111111111111111111111111111111112`, {
        headers: { 'X-API-KEY': this.apiKey, 'x-chain': 'solana' },
      });
      if (res.ok) {
        this.recordSuccess(Date.now() - start);
      } else {
        this.recordFailure(res.status === 429);
      }
    } catch {
      this.recordFailure();
    }
    return super.getHealth();
  }
}
