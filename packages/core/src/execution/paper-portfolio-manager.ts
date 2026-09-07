import { PaperExecutionSimulation } from '@meme-coin/types';
import { ExecutionSimulator, SimulatedOrderParams } from './execution-simulator.js';
import { createLogger } from '@meme-coin/utils';

const logger = createLogger('paper-portfolio-manager');

export interface PaperTradePosition extends PaperExecutionSimulation {
  id: string;
  openedAt: Date;
  closedAt?: Date | null;
  takeProfitPct?: number; // e.g. 50%
  stopLossPct?: number;   // e.g. -15%
  highestPriceSeen?: number;
}

export interface PortfolioSummary {
  startingBalanceUsd: number;
  currentCashUsd: number;
  openPositionsValueUsd: number;
  totalEquityUsd: number;
  realizedPnlUsd: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
}

export class PaperPortfolioManager {
  private startingBalanceUsd: number;
  private currentCashUsd: number;
  private positions: Map<string, PaperTradePosition> = new Map();

  constructor(startingBalanceUsd: number = 10000) {
    this.startingBalanceUsd = startingBalanceUsd;
    this.currentCashUsd = startingBalanceUsd;
  }

  /**
   * Opens a new paper position.
   */
  openPosition(
    orderParams: SimulatedOrderParams,
    rules: { takeProfitPct?: number; stopLossPct?: number } = { takeProfitPct: 50, stopLossPct: -15 }
  ): PaperTradePosition {
    if (orderParams.positionSizeUsd > this.currentCashUsd) {
      throw new Error(
        `Insufficient paper cash: required $${orderParams.positionSizeUsd}, available $${this.currentCashUsd}`
      );
    }

    const sim = ExecutionSimulator.simulateEntry(orderParams);
    const id = `pos-${orderParams.tokenId}-${Date.now()}`;

    const position: PaperTradePosition = {
      ...sim,
      id,
      openedAt: new Date(),
      takeProfitPct: rules.takeProfitPct ?? 50,
      stopLossPct: rules.stopLossPct ?? -15,
      highestPriceSeen: sim.simulatedEntryPrice,
    };

    this.currentCashUsd -= orderParams.positionSizeUsd;
    this.positions.set(id, position);

    logger.info(
      { id, tokenId: position.tokenId, entryPrice: position.simulatedEntryPrice, size: position.positionSizeUsd },
      'Opened paper trading position'
    );

    return position;
  }

  /**
   * Evaluates current market price against stop-loss and take-profit rules.
   */
  evaluatePriceUpdate(
    positionId: string,
    currentMarketPrice: number,
    poolLiquidityUsd: number
  ): { position: PaperTradePosition; triggeredExit: 'TP' | 'SL' | null } {
    const pos = this.positions.get(positionId);
    if (!pos || pos.status === 'CLOSED') {
      throw new Error(`Position ${positionId} not open`);
    }

    if (currentMarketPrice > (pos.highestPriceSeen ?? 0)) {
      pos.highestPriceSeen = currentMarketPrice;
    }

    const currentReturnPct =
      ((currentMarketPrice - pos.simulatedEntryPrice) / pos.simulatedEntryPrice) * 100;

    let triggeredExit: 'TP' | 'SL' | null = null;

    if (pos.takeProfitPct && currentReturnPct >= pos.takeProfitPct) {
      triggeredExit = 'TP';
    } else if (pos.stopLossPct && currentReturnPct <= pos.stopLossPct) {
      triggeredExit = 'SL';
    }

    if (triggeredExit) {
      this.closePosition(positionId, currentMarketPrice, poolLiquidityUsd);
    }

    return {
      position: this.positions.get(positionId)!,
      triggeredExit,
    };
  }

  /**
   * Closes an active paper position.
   */
  closePosition(
    positionId: string,
    exitMarketPrice: number,
    poolLiquidityUsd: number
  ): PaperTradePosition {
    const pos = this.positions.get(positionId);
    if (!pos || pos.status === 'CLOSED') {
      throw new Error(`Position ${positionId} not active`);
    }

    const closed = ExecutionSimulator.simulateExit(pos, exitMarketPrice, poolLiquidityUsd);
    const updatedPos: PaperTradePosition = {
      ...pos,
      ...closed,
      closedAt: new Date(),
    };

    this.positions.set(positionId, updatedPos);

    // Return cash + PnL
    const returnedCash = pos.positionSizeUsd + (updatedPos.realizedPnlUsd ?? 0);
    this.currentCashUsd += Math.max(0, returnedCash);

    logger.info(
      {
        id: positionId,
        realizedPnl: updatedPos.realizedPnlUsd,
        returnPct: updatedPos.realizedReturnPct,
      },
      'Closed paper position'
    );

    return updatedPos;
  }

  /**
   * Retrieves all positions (open and closed).
   */
  getPositions(status?: 'FILLED' | 'CLOSED'): PaperTradePosition[] {
    const list = Array.from(this.positions.values());
    if (status) {
      return list.filter((p) => p.status === status);
    }
    return list;
  }

  /**
   * Computes portfolio performance summary.
   */
  getSummary(): PortfolioSummary {
    const all = Array.from(this.positions.values());
    const closed = all.filter((p) => p.status === 'CLOSED');
    const open = all.filter((p) => p.status === 'FILLED');

    const totalRealizedPnl = closed.reduce((acc, p) => acc + (p.realizedPnlUsd ?? 0), 0);
    const openValue = open.reduce((acc, p) => acc + p.positionSizeUsd, 0);
    const winningTrades = closed.filter((p) => (p.realizedPnlUsd ?? 0) > 0).length;

    return {
      startingBalanceUsd: this.startingBalanceUsd,
      currentCashUsd: Number(this.currentCashUsd.toFixed(2)),
      openPositionsValueUsd: Number(openValue.toFixed(2)),
      totalEquityUsd: Number((this.currentCashUsd + openValue).toFixed(2)),
      realizedPnlUsd: Number(totalRealizedPnl.toFixed(2)),
      totalTrades: closed.length,
      winningTrades,
      winRate: closed.length > 0 ? Number(((winningTrades / closed.length) * 100).toFixed(1)) : 0,
    };
  }
}

export const paperPortfolioManager = new PaperPortfolioManager();
