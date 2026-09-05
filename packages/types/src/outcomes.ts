export interface HorizonPrice {
  price: number;
  returnPct: number;
  timestamp: Date;
}

export interface OutcomeEntity {
  id: string;
  tokenId: string;
  signalId?: string | null;
  anchorTimestamp: Date;
  anchorPrice: number;
  price1m?: HorizonPrice | null;
  price3m?: HorizonPrice | null;
  price5m?: HorizonPrice | null;
  price10m?: HorizonPrice | null;
  price30m?: HorizonPrice | null;
  price1h?: HorizonPrice | null;
  price6h?: HorizonPrice | null;
  price24h?: HorizonPrice | null;
  mfe: number; // Maximum Favorable Excursion (%)
  mae: number; // Maximum Adverse Excursion (%)
  timeToPeakSec?: number | null;
  timeToDrawdownSec?: number | null;
  liquidityChangePct?: number | null;
}

export interface PaperExecutionSimulation {
  signalId: string;
  tokenId: string;
  simulatedEntryPrice: number;
  simulatedExitPrice?: number | null;
  entryLatencyMs: number;
  slippagePct: number;
  estimatedFeeUsd: number;
  positionSizeUsd: number;
  realizedPnlUsd?: number | null;
  realizedReturnPct?: number | null;
  status: 'PENDING' | 'FILLED' | 'CLOSED' | 'CANCELLED';
}
