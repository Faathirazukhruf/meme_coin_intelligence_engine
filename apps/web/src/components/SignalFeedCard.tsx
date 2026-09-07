import React from 'react';
import Link from 'next/link';
import { Flame, ShieldAlert, ArrowUpRight, Activity } from 'lucide-react';
import { DecisionBadge } from './DecisionBadge';
import { Decision } from '@meme-coin/types';

export interface SignalFeedItem {
  id: string;
  tokenId: string;
  symbol: string;
  name: string;
  timestamp: string;
  decision: Decision;
  finalScore: number;
  opportunityScore: number;
  riskScore: number;
  confidenceScore: number;
  reason: string;
  priceUsd?: number;
  volume5m?: number;
  liquidityUsd?: number;
}

interface SignalFeedCardProps {
  signal: SignalFeedItem;
}

export function SignalFeedCard({ signal }: SignalFeedCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0e1420]/80 p-4 hover:border-slate-700 transition hover:bg-[#0e1420]">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-slate-700 flex items-center justify-center font-bold text-cyan-300">
            {signal.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">{signal.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">
                {signal.tokenId.slice(0, 4)}...{signal.tokenId.slice(-4)}
              </span>
            </div>
            <p className="text-xs text-slate-500">{signal.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DecisionBadge decision={signal.decision} />
          <Link
            href={`/tokens/${signal.tokenId}`}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Final Score</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {signal.finalScore.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Opportunity</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {signal.opportunityScore.toFixed(0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Risk</span>
          <span
            className={`font-mono font-bold text-sm ${
              signal.riskScore < 30 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {signal.riskScore.toFixed(0)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
          <span className="font-mono font-bold text-purple-400 text-sm">
            {signal.confidenceScore.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
        <Activity className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <span className="italic leading-relaxed">{signal.reason}</span>
      </div>
    </div>
  );
}
