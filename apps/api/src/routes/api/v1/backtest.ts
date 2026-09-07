import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '@meme-coin/database';
import {
  BacktestEngine,
  BacktestConfig,
} from '@meme-coin/core';

export const backtestRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/backtest - List historical backtests
  fastify.get('/', async (_request, reply) => {
    const list = await prisma.backtest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        runs: true,
      },
    });

    return reply.status(200).send({
      success: true,
      data: list,
    });
  });

  // GET /api/v1/backtest/:id - Get specific backtest details with signals
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const bt = await prisma.backtest.findUnique({
      where: { id },
      include: {
        runs: {
          include: {
            signals: {
              take: 100,
            },
          },
        },
      },
    });

    if (!bt) {
      return reply.status(404).send({
        success: false,
        error: { code: 'BACKTEST_NOT_FOUND', message: `Backtest ${id} not found` },
      });
    }

    return reply.status(200).send({
      success: true,
      data: bt,
    });
  });

  // POST /api/v1/backtest/run - Execute a new backtest simulation
  fastify.post('/run', async (request, reply) => {
    const body = request.body as {
      name?: string;
      description?: string;
      timeRangeStart?: string;
      timeRangeEnd?: string;
      minFinalScore?: number;
      maxRiskScore?: number;
      minConfidenceScore?: number;
      horizon?: '1m' | '3m' | '5m' | '10m' | '30m' | '1h' | '6h' | '24h';
      takeProfitPct?: number;
      stopLossPct?: number;
      positionSizeUsd?: number;
      startingCapitalUsd?: number;
    };

    const config: BacktestConfig = {
      name: body.name || `Backtest-${Date.now()}`,
      description: body.description || 'Automated quantitative strategy simulation',
      timeRangeStart: body.timeRangeStart ? new Date(body.timeRangeStart) : new Date(Date.now() - 7 * 86400000),
      timeRangeEnd: body.timeRangeEnd ? new Date(body.timeRangeEnd) : new Date(),
      startingCapitalUsd: body.startingCapitalUsd || 10000,
      strategy: {
        name: 'Momentum-Risk-V1',
        minFinalScore: body.minFinalScore ?? 75,
        maxRiskScore: body.maxRiskScore ?? 35,
        minConfidenceScore: body.minConfidenceScore ?? 70,
        allowedDecisions: ['PAPER_TRADE_CANDIDATE', 'HIGH_PRIORITY', 'ALERT'] as any,
        horizon: body.horizon || '5m',
        takeProfitPct: body.takeProfitPct ?? 50,
        stopLossPct: body.stopLossPct ?? -15,
        positionSizeUsd: body.positionSizeUsd ?? 200,
      },
    };

    const result = await BacktestEngine.executeFromDatabase(config);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  });
};
