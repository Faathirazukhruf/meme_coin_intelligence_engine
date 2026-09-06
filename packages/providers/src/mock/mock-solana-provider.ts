import { ChainProvider, IngestedTokenMetadata, IngestedTransaction, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';

export class MockSolanaChainProvider extends BaseProvider implements ChainProvider {
  private mockTokens = new Map<string, IngestedTokenMetadata>();
  private mockTransactions = new Map<string, IngestedTransaction>();

  constructor() {
    super('mock-solana');
  }

  setMockToken(token: IngestedTokenMetadata): void {
    this.mockTokens.set(token.address, token);
  }

  setMockTransaction(tx: IngestedTransaction): void {
    this.mockTransactions.set(tx.signature, tx);
  }

  async getTokenMetadata(address: string): Promise<IngestedTokenMetadata | null> {
    this.recordSuccess(1);
    return (
      this.mockTokens.get(address) || {
        chainId: 'solana',
        address,
        symbol: 'MOCK',
        name: 'Mock Token',
        decimals: 6,
        creatorAddress: 'MockCreator11111111111111111111111111111111',
      }
    );
  }

  async getTransaction(signature: string): Promise<IngestedTransaction | null> {
    this.recordSuccess(1);
    return (
      this.mockTransactions.get(signature) || {
        chainId: 'solana',
        signature,
        slot: 280000000,
        blockTime: new Date(),
        success: true,
        instructions: [],
      }
    );
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    this.recordSuccess(1);
    return super.getHealth();
  }
}
