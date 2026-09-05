import { prisma } from './client.js';

/**
 * Executes high-performance raw SQL time-window analytics queries.
 * Bypasses full ORM overhead for large historical datasets per Master Spec Section 3.
 */
export async function queryVolumeWindow(
  tokenId: string,
  startTime: Date,
  endTime: Date
): Promise<{ buyVolume: number; sellVolume: number; buyCount: number; sellCount: number }> {
  const result = await prisma.$queryRaw<
    Array<{
      buy_volume: number | null;
      sell_volume: number | null;
      buy_count: bigint | null;
      sell_count: bigint | null;
    }>
  >`
    SELECT
      SUM(CASE WHEN side = 'BUY' THEN quote_amount ELSE 0 END) as buy_volume,
      SUM(CASE WHEN side = 'SELL' THEN quote_amount ELSE 0 END) as sell_volume,
      COUNT(CASE WHEN side = 'BUY' THEN 1 END) as buy_count,
      COUNT(CASE WHEN side = 'SELL' THEN 1 END) as sell_count
    FROM trades
    WHERE token_id = ${tokenId}
      AND event_time >= ${startTime}
      AND event_time <= ${endTime}
  `;

  const row = result[0];
  return {
    buyVolume: row?.buy_volume ?? 0,
    sellVolume: row?.sell_volume ?? 0,
    buyCount: Number(row?.buy_count ?? 0),
    sellCount: Number(row?.sell_count ?? 0),
  };
}
