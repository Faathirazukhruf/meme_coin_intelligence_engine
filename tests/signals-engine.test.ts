import { describe, it, expect, beforeEach } from 'vitest';
import {
  SignalFilterEngine,
  AlertDispatcher,
  DEFAULT_ALERT_FILTER_CONFIG,
} from '@meme-coin/core';
import { SignalEntity, Decision, ScoreResult } from '@meme-coin/types';

describe('Signals & Alerting Engine Tests (PRD Section 14 & 20)', () => {
  let filterEngine: SignalFilterEngine;
  let dispatcher: AlertDispatcher;

  const mockScoreResult: ScoreResult = {
    id: 'score-test-1',
    tokenId: 'tok-sol-alpha',
    timestamp: new Date(),
    hardVeto: { isVetoed: false },
    risk: {
      liquidityRisk: 15,
      holderRisk: 20,
      devRisk: 10,
      walletRisk: 15,
      marketStructureRisk: 25,
      contractRisk: 10,
      totalRiskScore: 16.0,
    },
    opportunity: {
      marketMomentum: 85,
      volumeMomentum: 90,
      liquidityGrowth: 80,
      holderMomentum: 85,
      socialMomentum: 70,
      narrativeMomentum: 75,
      totalOpportunityScore: 82.5,
    },
    riskMultiplier: 0.84,
    finalScore: 78.5,
    confidenceScore: 88,
    scoringVersion: 'scoring_v1',
  };

  const mockSignal: SignalEntity = {
    id: 'sig-test-1',
    tokenId: 'tok-sol-alpha',
    timestamp: new Date(),
    signalType: 'MOMENTUM_DISCOVERY',
    scoreSnapshotId: 'score-test-1',
    decision: Decision.PAPER_TRADE_CANDIDATE,
    reason: 'high volume velocity + rapid holder onboarding + safe dev allocation',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    filterEngine = new SignalFilterEngine();
    dispatcher = new AlertDispatcher();
    filterEngine.clearCooldown();
  });

  describe('Signal Filter Engine', () => {
    it('approves alert for high-confidence, high-momentum signal', () => {
      const res = filterEngine.evaluate(mockSignal, mockScoreResult);
      expect(res.shouldAlert).toBe(true);
      expect(res.priority).toBe('CRITICAL');
      expect(res.rejectReasons.length).toBe(0);
    });

    it('rejects alert if token is vetoed by safety layer', () => {
      const vetoedScore: ScoreResult = {
        ...mockScoreResult,
        hardVeto: { isVetoed: true, reason: 'HONEYPOT' },
      };

      const res = filterEngine.evaluate(mockSignal, vetoedScore);
      expect(res.shouldAlert).toBe(false);
      expect(res.rejectReasons[0]).toContain('HONEYPOT');
    });

    it('rejects alert if final score is below minimum threshold', () => {
      const lowScore: ScoreResult = {
        ...mockScoreResult,
        finalScore: 45,
      };

      const res = filterEngine.evaluate(mockSignal, lowScore);
      expect(res.shouldAlert).toBe(false);
      expect(res.rejectReasons[0]).toContain('Final score');
    });

    it('rejects alert if risk score exceeds threshold', () => {
      const highRiskScore: ScoreResult = {
        ...mockScoreResult,
        risk: { ...mockScoreResult.risk, totalRiskScore: 68 },
      };

      const res = filterEngine.evaluate(mockSignal, highRiskScore);
      expect(res.shouldAlert).toBe(false);
      expect(res.rejectReasons[0]).toContain('Risk score');
    });

    it('enforces rate limit cooldown to avoid alert spam on same token', () => {
      const now = Date.now();
      const firstRes = filterEngine.evaluate(mockSignal, mockScoreResult, DEFAULT_ALERT_FILTER_CONFIG, now);
      expect(firstRes.shouldAlert).toBe(true);

      // Immediate subsequent evaluation within cooldown window (1 minute later)
      const secondRes = filterEngine.evaluate(mockSignal, mockScoreResult, DEFAULT_ALERT_FILTER_CONFIG, now + 60000);
      expect(secondRes.shouldAlert).toBe(false);
      expect(secondRes.rejectReasons[0]).toContain('Rate limit cooldown active');
    });
  });

  describe('Alert Dispatcher', () => {
    it('dispatches formatted alert to local event listeners', async () => {
      let receivedPayload: any = null;
      dispatcher.on('alert', (payload) => {
        receivedPayload = payload;
      });

      const filterRes = filterEngine.evaluate(mockSignal, mockScoreResult);
      const dispatched = await dispatcher.dispatch(mockSignal, mockScoreResult, filterRes, 'MOON');

      expect(receivedPayload).toBeDefined();
      expect(receivedPayload.tokenId).toBe(mockSignal.tokenId);
      expect(receivedPayload.tokenSymbol).toBe('MOON');
      expect(dispatched.markdownSummary).toContain('PAPER TRADE CANDIDATE');
      expect(dispatched.markdownSummary).toContain('78.5 / 100');
    });
  });
});
