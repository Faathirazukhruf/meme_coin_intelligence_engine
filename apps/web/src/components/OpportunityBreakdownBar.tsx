import React from 'react';
import { OpportunityBreakdown } from '@meme-coin/types';

interface OpportunityBreakdownBarProps {
  opportunity: OpportunityBreakdown;
}

export function OpportunityBreakdownBar({ opportunity }: OpportunityBreakdownBarProps) {
  const totalScore = opportunity.totalOpportunityScore;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">Momentum & Opportunity</span>
        <span className="px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/30 bg-cyan-500/20 text-cyan-400">
          {totalScore.toFixed(1)} / 100
        </span>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, totalScore))}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
          <div className="text-slate-500">Volume Velocity</div>
          <div className="font-mono font-semibold text-cyan-400">
            {opportunity.volumeMomentum.toFixed(0)}
          </div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
          <div className="text-slate-500">Holder Growth</div>
          <div className="font-mono font-semibold text-emerald-400">
            {opportunity.holderMomentum.toFixed(0)}
          </div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
          <div className="text-slate-500">Market Action</div>
          <div className="font-mono font-semibold text-purple-400">
            {opportunity.marketMomentum.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
