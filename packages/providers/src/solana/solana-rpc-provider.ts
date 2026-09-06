import { ChainProvider, IngestedTokenMetadata, IngestedTransaction, ProviderHealthReport } from '@meme-coin/types';
import { BaseProvider } from '../base-provider.js';
import { getConfig } from '@meme-coin/config';
import { withRetry } from '../retry/retry-helper.js';

export class SolanaRpcChainProvider extends BaseProvider implements ChainProvider {
  private rpcUrl: string;

  constructor(rpcUrl?: string) {
    super('solana-rpc');
    const config = getConfig();
    this.rpcUrl = rpcUrl || config.SOLANA_RPC_URL;
  }

  async getTokenMetadata(address: string): Promise<IngestedTokenMetadata | null> {
    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getAccountInfo',
              params: [address, { encoding: 'jsonParsed' }],
            }),
          });
          if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
          return (await res.json()) as { result?: { value?: { data?: { parsed?: { info?: Record<string, unknown> } } } } };
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);

      const parsed = response?.result?.value?.data?.parsed?.info;
      if (!parsed) return null;

      return {
        chainId: 'solana',
        address,
        symbol: String(parsed['symbol'] || 'UNKNOWN'),
        name: String(parsed['name'] || 'Unknown Token'),
        decimals: typeof parsed['decimals'] === 'number' ? parsed['decimals'] : 9,
        creatorAddress: parsed['mintAuthority'] ? String(parsed['mintAuthority']) : null,
      };
    } catch (err) {
      this.recordFailure();
      this.logger.error({ err, address }, 'Failed to fetch token metadata from Solana RPC');
      return null;
    }
  }

  async getTransaction(signature: string): Promise<IngestedTransaction | null> {
    const start = Date.now();
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTransaction',
              params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
            }),
          });
          if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
          return (await res.json()) as {
            result?: {
              slot?: number;
              blockTime?: number;
              meta?: { err?: unknown };
              transaction?: { message?: { instructions?: unknown[] } };
            };
          };
        },
        this.name
      );

      this.recordSuccess(Date.now() - start);

      const tx = response?.result;
      if (!tx) return null;

      return {
        chainId: 'solana',
        signature,
        slot: tx.slot,
        blockTime: tx.blockTime ? new Date(tx.blockTime * 1000) : new Date(),
        success: tx.meta?.err === null,
        instructions: tx.transaction?.message?.instructions || [],
      };
    } catch (err) {
      this.recordFailure();
      this.logger.error({ err, signature }, 'Failed to fetch transaction from Solana RPC');
      return null;
    }
  }

  override async getHealth(): Promise<ProviderHealthReport> {
    const start = Date.now();
    try {
      const res = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot' }),
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
