import React from 'react';
import { RiskBreakdown } from '@meme-coin/types';

interface RiskBreakdownBarProps {
  risk: RiskBreakdown;
  showLabels?: boolean;
}

export function RiskBreakdownBar({ risk, showLabels = true }: RiskBreakdownBarProps) {
  const getRiskColor = (score: number) => {
    if (score < 25) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (score < 45) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  };

  const getBarColor = (score: number) => {
    if (score < 25) return 'bg-emerald-500';
    if (score < 45) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const totalScore = risk.totalRiskScore;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">Composite Risk Score</span>
        <span
          className={`px-2 py-0.5 rounded font-mono font-bold border ${getRiskColor(totalScore)}`}
        >
          {totalScore.toFixed(1)} / 100
        </span>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-300 ${getBarColor(totalScore)}`}
          style={{ width: `${Math.min(100, Math.max(0, totalScore))}%` }}
        />
      </div>

      {showLabels && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
            <div className="text-slate-500">Liquidity</div>
            <div className="font-mono font-semibold text-slate-200">
              {risk.liquidityRisk.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
            <div className="text-slate-500">Dev Supply</div>
            <div className="font-mono font-semibold text-slate-200">
              {risk.devRisk.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
            <div className="text-slate-500">Holder Conc.</div>
            <div className="font-mono font-semibold text-slate-200">
              {risk.holderRisk.toFixed(0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
