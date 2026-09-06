import {
  TokenEntity,
  PoolEntity,
  TradeEntity,
  LiquidityEventEntity,
  CanonicalEventRecord,
} from '@meme-coin/types';
import { ParsedInstructionResult, RawSolanaTransaction } from '@meme-coin/providers';
import { getConfig } from '@meme-coin/config';

export interface NormalizedIngestionResult {
  tokens: Partial<TokenEntity>[];
  pools: Partial<PoolEntity>[];
  trades: Partial<TradeEntity>[];
  liquidityEvents: Partial<LiquidityEventEntity>[];
  canonicalEvents: Partial<CanonicalEventRecord>[];
}

export class EventNormalizer {
  static normalize(
    parsedResults: ParsedInstructionResult[],
    rawTx: RawSolanaTransaction,
    rawDataId?: string
  ): NormalizedIngestionResult {
    const config = getConfig();
    const eventTime = rawTx.blockTime ? new Date(rawTx.blockTime * 1000) : new Date();
    const parserVersion = config.PARSER_VERSION || 'parser_v1';

    const output: NormalizedIngestionResult = {
      tokens: [],
      pools: [],
      trades: [],
      liquidityEvents: [],
      canonicalEvents: [],
    };

    for (const res of parsedResults) {
      if (res.action === 'TOKEN_CREATE' && res.tokenAddress) {
        output.tokens.push({
          chainId: 'solana',
          address: res.tokenAddress,
          symbol: res.symbol || 'MEME',
          name: res.name || 'Meme Coin',
          decimals: res.decimals ?? 6,
          creatorAddress: res.creatorAddress,
          createdAt: eventTime,
          firstSeenAt: new Date(),
          status: 'active',
          createdSource: res.protocol,
        });

        output.canonicalEvents.push({
          eventType: 'TOKEN_CREATED',
          source: res.protocol,
          eventTime,
          ingestedAt: new Date(),
          slot: rawTx.slot,
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          walletAddress: res.creatorAddress,
          rawDataId,
        });
      }

      if (res.action === 'POOL_CREATE' && res.poolAddress && res.tokenAddress) {
        output.pools.push({
          chainId: 'solana',
          dex: res.protocol,
          protocol: res.protocol,
          poolAddress: res.poolAddress,
          baseToken: res.baseToken || res.tokenAddress,
          quoteToken: res.quoteToken || 'So11111111111111111111111111111111111111112',
          createdAt: eventTime,
          firstLiquidityAt: eventTime,
          status: 'active',
        });

        output.canonicalEvents.push({
          eventType: 'POOL_CREATED',
          source: res.protocol,
          eventTime,
          ingestedAt: new Date(),
          slot: rawTx.slot,
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          rawDataId,
        });
      }

      if (res.action === 'TRADE' && res.poolAddress) {
        output.trades.push({
          chainId: 'solana',
          eventTime,
          ingestedAt: new Date(),
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          side: res.side || 'BUY',
          price: res.price ?? 0.0001,
          baseAmount: res.baseAmount ?? 1000,
          quoteAmount: res.quoteAmount ?? 0.1,
          buyer: res.buyer,
          seller: res.seller,
          rawDataId,
          parserVersion,
        });

        output.canonicalEvents.push({
          eventType: res.side === 'BUY' ? 'BUY' : 'SELL',
          source: res.protocol,
          eventTime,
          ingestedAt: new Date(),
          slot: rawTx.slot,
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          walletAddress: res.buyer || res.seller,
          price: res.price ?? 0.0001,
          amount: res.baseAmount ?? 1000,
          rawDataId,
        });
      }

      if ((res.action === 'LIQUIDITY_ADD' || res.action === 'LIQUIDITY_REMOVE') && res.poolAddress) {
        output.liquidityEvents.push({
          eventType: res.action === 'LIQUIDITY_ADD' ? 'ADD' : 'REMOVE',
          eventTime,
          amount: res.liquidityAmount ?? 0,
          transactionHash: rawTx.signature,
          rawDataId,
          parserVersion,
        });

        output.canonicalEvents.push({
          eventType: res.action === 'LIQUIDITY_ADD' ? 'LIQUIDITY_ADDED' : 'LIQUIDITY_REMOVED',
          source: res.protocol,
          eventTime,
          ingestedAt: new Date(),
          slot: rawTx.slot,
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          amount: res.liquidityAmount ?? 0,
          rawDataId,
        });
      }

      if (res.action === 'TOKEN_GRADUATE' && res.tokenAddress) {
        output.canonicalEvents.push({
          eventType: 'TOKEN_GRADUATED',
          source: res.protocol,
          eventTime,
          ingestedAt: new Date(),
          slot: rawTx.slot,
          transactionHash: rawTx.signature,
          eventIndex: res.eventIndex,
          rawDataId,
        });
      }
    }

    return output;
  }
}
