import { describe, it, expect } from 'vitest';
import {
  ChainProvider,
  MarketProvider,
} from '@meme-coin/types';
import {
  SolanaRpcChainProvider,
  HeliusChainProvider,
  MockSolanaChainProvider,
  DexScreenerMarketProvider,
  BirdeyeMarketProvider,
  MockMarketProvider,
} from '@meme-coin/providers';

describe('Provider Abstraction Contract Tests', () => {
  describe('Chain Providers', () => {
    const chainProviders: Array<{ name: string; provider: ChainProvider }> = [
      { name: 'SolanaRpcChainProvider', provider: new SolanaRpcChainProvider() },
      { name: 'HeliusChainProvider', provider: new HeliusChainProvider() },
      { name: 'MockSolanaChainProvider', provider: new MockSolanaChainProvider() },
    ];

    chainProviders.forEach(({ name, provider }) => {
      it(`${name} implements ChainProvider contract with health reporting`, async () => {
        expect(provider.name).toBeDefined();
        expect(typeof provider.getTokenMetadata).toBe('function');
        expect(typeof provider.getTransaction).toBe('function');

        const health = await provider.getHealth();
        expect(health).toHaveProperty('status');
        expect(health).toHaveProperty('latencyMs');
      });
    });

    it('MockSolanaChainProvider returns expected mock data', async () => {
      const mock = new MockSolanaChainProvider();
      const meta = await mock.getTokenMetadata('MockMintAddress111');
      expect(meta?.symbol).toBe('MOCK');
      expect(meta?.chainId).toBe('solana');
    });
  });

  describe('Market Providers', () => {
    const marketProviders: Array<{ name: string; provider: MarketProvider }> = [
      { name: 'DexScreenerMarketProvider', provider: new DexScreenerMarketProvider() },
      { name: 'BirdeyeMarketProvider', provider: new BirdeyeMarketProvider() },
      { name: 'MockMarketProvider', provider: new MockMarketProvider() },
    ];

    marketProviders.forEach(({ name, provider }) => {
      it(`${name} implements MarketProvider contract with market data methods`, async () => {
        expect(provider.name).toBeDefined();
        expect(typeof provider.getTokenMarket).toBe('function');
        expect(typeof provider.getOHLCV).toBe('function');

        const health = await provider.getHealth();
        expect(health).toHaveProperty('status');
      });
    });

    it('MockMarketProvider returns valid simulated market overview', async () => {
      const mock = new MockMarketProvider();
      const market = await mock.getTokenMarket('MockAddress123');
      expect(market?.priceUsd).toBeGreaterThan(0);
      expect(market?.liquidityUsd).toBeGreaterThan(0);
    });
  });
});
