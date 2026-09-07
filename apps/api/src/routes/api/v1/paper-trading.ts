import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { paperPortfolioManager, PositionSizer } from '@meme-coin/core';

export const paperTradingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/paper-trading/portfolio - Portfolio balance & performance
  fastify.get('/portfolio', async (_request, reply) => {
    const summary = paperPortfolioManager.getSummary();
    return reply.status(200).send({
      success: true,
      data: summary,
    });
  });

  // GET /api/v1/paper-trading/positions - Open & closed positions
  fastify.get('/positions', async (request, reply) => {
    const query = request.query as { status?: 'FILLED' | 'CLOSED' };
    const positions = paperPortfolioManager.getPositions(query.status);
    return reply.status(200).send({
      success: true,
      data: positions,
    });
  });

  // POST /api/v1/paper-trading/order - Open a paper position
  fastify.post('/order', async (request, reply) => {
    const body = request.body as {
      signalId: string;
      tokenId: string;
      marketPrice: number;
      poolLiquidityUsd: number;
      positionSizeUsd?: number;
      finalScore?: number;
      riskScore?: number;
      confidenceScore?: number;
      takeProfitPct?: number;
      stopLossPct?: number;
    };

    if (!body.signalId || !body.tokenId || !body.marketPrice || !body.poolLiquidityUsd) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required order fields' },
      });
    }

    let sizeUsd = body.positionSizeUsd;
    if (!sizeUsd && body.finalScore) {
      const summary = paperPortfolioManager.getSummary();
      const sizing = PositionSizer.calculatePositionSize({
        accountBalanceUsd: summary.currentCashUsd,
        finalScore: body.finalScore,
        riskScore: body.riskScore ?? 25,
        confidenceScore: body.confidenceScore ?? 80,
        poolLiquidityUsd: body.poolLiquidityUsd,
      });
      sizeUsd = sizing.positionSizeUsd;
    }

    if (!sizeUsd || sizeUsd <= 0) {
      sizeUsd = 100; // default minimum $100
    }

    try {
      const position = paperPortfolioManager.openPosition(
        {
          signalId: body.signalId,
          tokenId: body.tokenId,
          marketPrice: body.marketPrice,
          poolLiquidityUsd: body.poolLiquidityUsd,
          positionSizeUsd: sizeUsd,
        },
        {
          takeProfitPct: body.takeProfitPct ?? 50,
          stopLossPct: body.stopLossPct ?? -15,
        }
      );

      return reply.status(201).send({
        success: true,
        data: position,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'EXECUTION_FAILED', message: err.message },
      });
    }
  });

  // POST /api/v1/paper-trading/close/:id - Close an open paper position
  fastify.post('/close/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      exitPrice: number;
      poolLiquidityUsd: number;
    };

    if (!body.exitPrice || !body.poolLiquidityUsd) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'exitPrice and poolLiquidityUsd are required' },
      });
    }

    try {
      const closed = paperPortfolioManager.closePosition(
        id,
        body.exitPrice,
        body.poolLiquidityUsd
      );

      return reply.status(200).send({
        success: true,
        data: closed,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'CLOSE_FAILED', message: err.message },
      });
    }
  });
};
