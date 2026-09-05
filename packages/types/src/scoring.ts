export const Decision = {
  IGNORE: 'IGNORE',
  WATCH: 'WATCH',
  ALERT: 'ALERT',
  HIGH_PRIORITY: 'HIGH_PRIORITY',
  PAPER_TRADE_CANDIDATE: 'PAPER_TRADE_CANDIDATE',
} as const;
export type Decision = (typeof Decision)[keyof typeof Decision];

export interface HardVetoResult {
  isVetoed: boolean;
  reason?: 'HONEYPOT' | 'UNSELLABLE' | 'LIQUIDITY_REMOVED' | 'CRITICAL_CONTRACT_RISK' | 'INVALID_MARKET' | 'INSUFFICIENT_DATA' | string;
  details?: Record<string, unknown>;
}

export interface RiskBreakdown {
  liquidityRisk: number;       // 0-100 (higher = worse)
  holderRisk: number;          // 0-100
  devRisk: number;             // 0-100
  walletRisk: number;          // 0-100
  marketStructureRisk: number; // 0-100
  contractRisk: number;        // 0-100
  totalRiskScore: number;      // 0-100
}

export interface OpportunityBreakdown {
  marketMomentum: number;      // 0-100 (higher = better)
  volumeMomentum: number;      // 0-100
  liquidityMomentum: number;   // 0-100
  holderMomentum: number;      // 0-100
  socialMomentum: number;      // 0-100
  narrativeMomentum: number;   // 0-100
  totalOpportunityScore: number; // 0-100
}

export interface ScoreResult {
  id: string;
  tokenId: string;
  timestamp: Date;
  hardVeto: HardVetoResult;
  risk: RiskBreakdown;
  opportunity: OpportunityBreakdown;
  riskMultiplier: number;      // [0, 1]
  finalScore: number;          // [0, 100]
  confidenceScore: number;     // [0, 100]
  scoringVersion: string;
}

export interface SignalEntity {
  id: string;
  tokenId: string;
  timestamp: Date;
  signalType: string;
  scoreSnapshotId: string;
  decision: Decision;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISMISSED';
}
