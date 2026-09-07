'use client';

import React, { useState } from 'react';
import {
  Radio,
  Search,
  Filter,
  SlidersHorizontal,
  BellRing,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SignalFeedCard, SignalFeedItem } from '@/components/SignalFeedCard';
import { Decision } from '@meme-coin/types';

const allSignals: SignalFeedItem[] = [
  {
    id: 'sig-001',
    tokenId: '7EYnhQoR9YM3N7UoaKRoA44PBVfGQxeNFyN579bPump',
    symbol: 'PEPE_SOL',
    name: 'Pepe Solana Original',
    timestamp: '2 mins ago',
    decision: 'PAPER_TRADE_CANDIDATE',
    finalScore: 88.4,
    opportunityScore: 92.0,
    riskScore: 18.5,
    confidenceScore: 94.0,
    reason: 'Exponential volume velocity (+340%) + zero dev dumping + organic holder onboarding',
    priceUsd: 0.0042,
    volume5m: 64200,
    liquidityUsd: 125000,
  },
  {
    id: 'sig-002',
    tokenId: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
    symbol: 'DOGE_AI',
    name: 'Autonomous Doge Agent',
    timestamp: '7 mins ago',
    decision: 'HIGH_PRIORITY',
    finalScore: 76.8,
    opportunityScore: 84.5,
    riskScore: 24.0,
    confidenceScore: 89.0,
    reason: 'Multi-cluster whale accumulation + Raydium migration liquidity lock',
    priceUsd: 0.0185,
    volume5m: 42100,
    liquidityUsd: 89000,
  },
  {
    id: 'sig-003',
    tokenId: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    symbol: 'SOL_CAT',
    name: 'Quantum Kitty',
    timestamp: '15 mins ago',
    decision: 'ALERT',
    finalScore: 68.2,
    opportunityScore: 78.0,
    riskScore: 32.0,
    confidenceScore: 82.0,
    reason: 'Rapid social mentions velocity + healthy buy pressure imbalance (0.72)',
    priceUsd: 0.00085,
    volume5m: 21500,
    liquidityUsd: 45000,
  },
  {
    id: 'sig-004',
    tokenId: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'NEO_MEME',
    name: 'Matrix Red Pill',
    timestamp: '24 mins ago',
    decision: 'WATCH',
    finalScore: 54.1,
    opportunityScore: 62.0,
    riskScore: 38.0,
    confidenceScore: 75.0,
    reason: 'Initial liquidity seeded on Meteora, monitoring first 10 minutes of trading',
    priceUsd: 0.00012,
    volume5m: 8500,
    liquidityUsd: 18000,
  },
  {
    id: 'sig-005',
    tokenId: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHY36ghBQea8nE',
    symbol: 'QUANTUM',
    name: 'Quantum Engine',
    timestamp: '31 mins ago',
    decision: 'PAPER_TRADE_CANDIDATE',
    finalScore: 82.1,
    opportunityScore: 87.0,
    riskScore: 16.0,
    confidenceScore: 91.0,
    reason: 'Multi-dex liquidity expansion + rapid organic buyer dispersion',
    priceUsd: 0.034,
    volume5m: 51200,
    liquidityUsd: 95000,
  },
];

export default function SignalsRadarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(50);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSignals = allSignals.filter((sig) => {
    if (selectedDecision !== 'ALL' && sig.decision !== selectedDecision) return false;
    if (sig.finalScore < minScore) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sig.symbol.toLowerCase().includes(q) ||
        sig.name.toLowerCase().includes(q) ||
        sig.tokenId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Live Signals & Discovery Radar
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-dimensional scoring evaluating momentum velocity, holder growth, and structural safety.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 self-start md:self-auto rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by symbol, token name, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Decision Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {['ALL', 'PAPER_TRADE_CANDIDATE', 'HIGH_PRIORITY', 'ALERT', 'WATCH'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDecision(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedDecision === d
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d === 'ALL'
                  ? 'All'
                  : d === 'PAPER_TRADE_CANDIDATE'
                  ? 'Paper Trade'
                  : d === 'HIGH_PRIORITY'
                  ? 'High Priority'
                  : d === 'ALERT'
                  ? 'Alert'
                  : 'Watch'}
              </button>
            ))}
          </div>

          {/* Min Final Score Slider */}
          <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Min Final Score</span>
                <span className="font-mono font-bold text-cyan-400">{minScore}</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signals Stream List */}
      <div className="space-y-3">
        {filteredSignals.length > 0 ? (
          filteredSignals.map((sig) => (
            <SignalFeedCard key={sig.id} signal={sig} />
          ))
        ) : (
          <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-12 text-center">
            <p className="text-sm text-slate-400">
              No active signals match the selected filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
