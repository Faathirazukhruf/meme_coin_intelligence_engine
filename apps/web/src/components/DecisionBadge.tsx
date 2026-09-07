import React from 'react';
import { Decision } from '@meme-coin/types';

interface DecisionBadgeProps {
  decision: Decision | string;
  size?: 'sm' | 'md' | 'lg';
}

export function DecisionBadge({ decision, size = 'md' }: DecisionBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  switch (decision) {
    case 'PAPER_TRADE_CANDIDATE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] ${sizeClasses[size]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          PAPER TRADE
        </span>
      );
    case 'HIGH_PRIORITY':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] ${sizeClasses[size]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          HIGH PRIORITY
        </span>
      );
    case 'ALERT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] ${sizeClasses[size]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          ALERT
        </span>
      );
    case 'WATCH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 ${sizeClasses[size]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          WATCH
        </span>
      );
    case 'IGNORE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 text-slate-400 ${sizeClasses[size]}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          IGNORE
        </span>
      );
  }
}
