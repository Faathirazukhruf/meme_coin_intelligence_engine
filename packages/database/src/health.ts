import { prisma } from './client.js';

export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: (err as Error)?.message ?? 'Database connection failed',
    };
  }
}
