import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { alertDispatcher, signalFilterEngine } from '@meme-coin/core';

export const alertsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/alerts/webhook - Register a webhook URL
  fastify.post('/webhook', async (request, reply) => {
    const body = request.body as { url?: string };
    if (!body.url) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_URL', message: 'url field is required' },
      });
    }

    alertDispatcher.addWebhook(body.url);

    return reply.status(200).send({
      success: true,
      message: `Registered webhook destination: ${body.url}`,
    });
  });

  // POST /api/v1/alerts/test - Trigger a simulated alert for testing
  fastify.post('/test', async (request, reply) => {
    const body = request.body as {
      tokenId?: string;
      tokenSymbol?: string;
    };

    const tokenId = body.tokenId || 'So11111111111111111111111111111111111111112';
    const tokenSymbol = body.tokenSymbol || 'TEST_MEME';

    const mockSignal = {
      id: `sig-test-${Date.now()}`,
      tokenId,
      timestamp: new Date(),
      signalType: 'MOMENTUM_DISCOVERY',
      scoreSnapshotId: 'score-mock-1',
      decision: 'PAPER_TRADE_CANDIDATE' as const,
      reason: 'rapid holder growth + volume breakout + clean liquidity structure',
      status: 'ACTIVE' as const,
    };

    const mockScoreResult = {
      id: 'score-mock-1',
      tokenId,
      timestamp: new Date(),
      hardVeto: { isVetoed: false },
      risk: {
        liquidityRisk: 18,
        holderRisk: 22,
        devRisk: 15,
        walletRisk: 10,
        marketStructureRisk: 20,
        contractRisk: 15,
        totalRiskScore: 16.5,
      },
      opportunity: {
        marketMomentum: 85,
        volumeMomentum: 90,
        liquidityMomentum: 78,
        holderMomentum: 88,
        socialMomentum: 65,
        narrativeMomentum: 70,
        totalOpportunityScore: 82.5,
      },
      riskMultiplier: 0.835,
      finalScore: 82.5 * 0.835,
      confidenceScore: 92,
      scoringVersion: 'scoring_v1',
    };

    const filterResult = signalFilterEngine.evaluate(mockSignal, mockScoreResult);
    const dispatched = await alertDispatcher.dispatch(
      mockSignal,
      mockScoreResult,
      filterResult,
      tokenSymbol
    );

    return reply.status(200).send({
      success: true,
      data: dispatched,
    });
  });
};
