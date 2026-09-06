import { MarketProvider, IngestedMarketOverview, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';

export class MockMarketProvider extends BaseProvider implements MarketProvider {
  private mockMarkets = new Map<string, IngestedMarketOverview>();

  constructor() {
    super('mock-market');
  }

  setMockMarket(market: IngestedMarketOverview): void {
    this.mockMarkets.set(market.tokenAddress, market);
  }

  async getTokenMarket(address: string): Promise<IngestedMarketOverview | null> {
    this.recordSuccess(1);
    return (
      this.mockMarkets.get(address) || {
        chainId: 'solana',
        tokenAddress: address,
        priceUsd: 0.00045,
        liquidityUsd: 25000,
        fdvUsd: 450000,
        volume24hUsd: 120000,
        timestamp: new Date(),
      }
    );
  }

  async getOHLCV(_address: string, _resolution: string, _from: Date, _to: Date): Promise<unknown[]> {
    return [
      { time: Date.now() - 300000, open: 0.0004, high: 0.00046, low: 0.00039, close: 0.00045, volume: 5000 },
    ];
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    this.recordSuccess(1);
    return super.getHealth();
  }
}
