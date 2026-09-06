import { ChainProvider, IngestedTokenMetadata, IngestedTransaction, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';
import { getConfig } from '@meme-coin/config';
import { withRetry } from '../retry/retry-helper.js';

interface HeliusTokenMetadataResponse {
  decimals?: number;
  onChainMetadata?: {
    metadata?: {
      updateAuthority?: string;
      data?: { symbol?: string; name?: string; uri?: string };
    };
  };
  legacyMetadata?: { symbol?: string; name?: string };
}

interface HeliusTransactionResponse {
  slot?: number;
  timestamp?: number;
  transactionError?: unknown;
  instructions?: unknown[];
}

export class HeliusChainProvider extends BaseProvider implements ChainProvider {
  private apiKey: string;
  private rpcUrl: string;

  constructor(apiKey?: string) {
    super('helius');
    const config = getConfig();
    this.apiKey = apiKey || config.HELIUS_API_KEY || '';
    this.rpcUrl = config.HELIUS_RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
  }

  async getTokenMetadata(address: string): Promise<IngestedTokenMetadata | null> {
    if (!this.apiKey) {
      return null;
    }

    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mintAccounts: [address] }),
          });
          if (!res.ok) throw new Error(`Helius HTTP ${res.status}`);
          return (await res.json()) as HeliusTokenMetadataResponse[];
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);
      const item = response?.[0];
      if (!item) return null;

      return {
        chainId: 'solana',
        address,
        symbol: item.onChainMetadata?.metadata?.data?.symbol || item.legacyMetadata?.symbol || 'UNKNOWN',
        name: item.onChainMetadata?.metadata?.data?.name || item.legacyMetadata?.name || 'Unknown Token',
        decimals: item.decimals ?? 9,
        creatorAddress: item.onChainMetadata?.metadata?.updateAuthority || null,
        uri: item.onChainMetadata?.metadata?.data?.uri || null,
      };
    } catch (err) {
      this.recordFailure();
      this.logger.error({ err, address }, 'Failed to fetch metadata from Helius');
      return null;
    }
  }

  async getTransaction(signature: string): Promise<IngestedTransaction | null> {
    if (!this.apiKey) {
      return null;
    }

    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`https://api.helius.xyz/v0/transactions/?api-key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions: [signature] }),
          });
          if (!res.ok) throw new Error(`Helius HTTP ${res.status}`);
          return (await res.json()) as HeliusTransactionResponse[];
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);
      const tx = response?.[0];
      if (!tx) return null;

      return {
        chainId: 'solana',
        signature,
        slot: tx.slot,
        blockTime: tx.timestamp ? new Date(tx.timestamp * 1000) : new Date(),
        success: tx.transactionError === null,
        instructions: tx.instructions || [],
      };
    } catch (err) {
      this.recordFailure();
      this.logger.error({ err, signature }, 'Failed to fetch transaction from Helius');
      return null;
    }
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    if (!this.apiKey) {
      this.recordFailure();
      return super.getHealth();
    }
    const start = Date.now();
    try {
      const res = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
      });
      if (res.ok) {
        this.recordSuccess(Date.now() - start);
      } else {
        this.recordFailure();
      }
    } catch {
      this.recordFailure();
    }
    return super.getHealth();
  }
}
