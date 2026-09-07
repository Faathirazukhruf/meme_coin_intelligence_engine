import { EventEmitter } from 'node:events';
import {
  SignalEntity,
  ScoreResult,
  Decision,
} from '@meme-coin/types';
import { createLogger } from '@meme-coin/utils';
import { AlertFilterResult } from './signal-filter-engine.js';

const logger = createLogger('alert-dispatcher');

export interface AlertNotificationPayload {
  id: string;
  timestamp: string;
  tokenId: string;
  tokenSymbol?: string;
  decision: Decision;
  priority: AlertFilterResult['priority'];
  finalScore: number;
  riskScore: number;
  opportunityScore: number;
  confidenceScore: number;
  reason: string;
  markdownSummary: string;
}

export type AlertHandler = (payload: AlertNotificationPayload) => Promise<void> | void;

export class AlertDispatcher extends EventEmitter {
  private webhookUrls: string[] = [];

  constructor() {
    super();
  }

  /**
   * Registers a webhook destination URL.
   */
  addWebhook(url: string): void {
    if (!this.webhookUrls.includes(url)) {
      this.webhookUrls.push(url);
    }
  }

  /**
   * Dispatches an alert to all registered subscribers and webhooks.
   */
  async dispatch(
    signal: SignalEntity,
    scoreResult: ScoreResult,
    filterResult: AlertFilterResult,
    tokenSymbol: string = 'TOKEN'
  ): Promise<AlertNotificationPayload> {
    const payload: AlertNotificationPayload = {
      id: `alert-${signal.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tokenId: signal.tokenId,
      tokenSymbol,
      decision: signal.decision,
      priority: filterResult.priority,
      finalScore: Number(scoreResult.finalScore.toFixed(1)),
      riskScore: Number(scoreResult.risk.totalRiskScore.toFixed(1)),
      opportunityScore: Number(scoreResult.opportunity.totalOpportunityScore.toFixed(1)),
      confidenceScore: Number(scoreResult.confidenceScore.toFixed(1)),
      reason: signal.reason,
      markdownSummary: this.formatMarkdown(signal, scoreResult, filterResult, tokenSymbol),
    };

    logger.info(
      { tokenId: signal.tokenId, priority: payload.priority, finalScore: payload.finalScore },
      `🚨 [ALERT] ${payload.decision} for ${tokenSymbol} (${signal.tokenId.slice(0, 8)}...)`
    );

    // Emit event for local listeners / WebSockets
    this.emit('alert', payload);

    // Dispatch to Webhooks asynchronously
    for (const url of this.webhookUrls) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        logger.warn({ err, url }, 'Failed to POST alert to webhook');
      }
    }

    return payload;
  }

  /**
   * Formats a clean, readable alert message for Telegram/Discord/Slack/Dashboard.
   */
  private formatMarkdown(
    signal: SignalEntity,
    scoreResult: ScoreResult,
    _filterResult: AlertFilterResult,
    tokenSymbol: string
  ): string {
    const emojiMap: Record<Decision, string> = {
      [Decision.PAPER_TRADE_CANDIDATE]: '🚀 [PAPER TRADE CANDIDATE]',
      [Decision.HIGH_PRIORITY]: '🔥 [HIGH PRIORITY]',
      [Decision.ALERT]: '⚡ [ALERT]',
      [Decision.WATCH]: '👀 [WATCH]',
      [Decision.IGNORE]: '⚪ [IGNORE]',
    };

    const header = `${emojiMap[signal.decision] || '🚨'} **${tokenSymbol}** (${signal.tokenId.slice(0, 6)}...${signal.tokenId.slice(-4)})`;
    const metrics = [
      `• **Final Score**: \`${scoreResult.finalScore.toFixed(1)} / 100\``,
      `• **Opportunity**: \`${scoreResult.opportunity.totalOpportunityScore.toFixed(1)}\` | **Risk**: \`${scoreResult.risk.totalRiskScore.toFixed(1)}\` | **Confidence**: \`${scoreResult.confidenceScore.toFixed(1)}%\``,
      `• **Risk Breakdown**: Liq: \`${scoreResult.risk.liquidityRisk.toFixed(0)}\` | Dev: \`${scoreResult.risk.devRisk.toFixed(0)}\` | Holder: \`${scoreResult.risk.holderRisk.toFixed(0)}\``,
      `• **Drivers**: _${signal.reason}_`,
    ].join('\n');

    return `${header}\n${metrics}`;
  }
}

export const alertDispatcher = new AlertDispatcher();
