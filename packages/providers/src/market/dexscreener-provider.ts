import { MarketProvider, IngestedMarketOverview, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';
import { getConfig } from '@meme-coin/config';
import { withRetry } from '../retry/retry-helper.js';

interface DexScreenerResponse {
  pairs?: Array<{
    chainId?: string;
    priceUsd?: string;
    liquidity?: { usd?: number };
    fdv?: number;
    volume?: { h24?: number };
  }>;
}

export class DexScreenerMarketProvider extends BaseProvider implements MarketProvider {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    super('dexscreener');
    const config = getConfig();
    this.baseUrl = baseUrl || config.DEXSCREENER_API_URL || 'https://api.dexscreener.com';
  }

  async getTokenMarket(address: string): Promise<IngestedMarketOverview | null> {
    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.baseUrl}/latest/dex/tokens/${address}`);
          if (res.status === 429) {
            this.recordFailure(true);
            throw new Error('DexScreener Rate Limited');
          }
          if (!res.ok) throw new Error(`DexScreener HTTP ${res.status}`);
          return (await res.json()) as DexScreenerResponse;
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);
      const pair = response?.pairs?.[0];
      if (!pair) return null;

      return {
        chainId: pair.chainId || 'solana',
        tokenAddress: address,
        priceUsd: parseFloat(pair.priceUsd ?? '0'),
        liquidityUsd: pair.liquidity?.usd ?? 0,
        fdvUsd: pair.fdv ?? 0,
        volume24hUsd: pair.volume?.h24 ?? 0,
        timestamp: new Date(),
      };
    } catch (err) {
      this.logger.error({ err, address }, 'Failed to fetch token market from DexScreener');
      return null;
    }
  }

  async getOHLCV(_address: string, _resolution: string, _from: Date, _to: Date): Promise<unknown[]> {
    return [];
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/latest/dex/tokens/So11111111111111111111111111111111111111112`);
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
