'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { SignalFeedCard, SignalFeedItem } from '@/components/SignalFeedCard';
import { DecisionBadge } from '@/components/DecisionBadge';

const mockSignals: SignalFeedItem[] = [
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
];

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAPER' | 'HIGH'>('ALL');

  const filteredSignals = mockSignals.filter((sig) => {
    if (activeTab === 'PAPER') return sig.decision === 'PAPER_TRADE_CANDIDATE';
    if (activeTab === 'HIGH') return sig.decision === 'HIGH_PRIORITY' || sig.decision === 'PAPER_TRADE_CANDIDATE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Market Regime & Core Principles */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Solana Market Engine Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Deterministic Meme Coin Intelligence & Discovery
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Zero look-ahead bias (<span className="font-mono text-cyan-400">t ≤ T₀</span>). Hard veto honeypot rejection. Continuous quantitative momentum and risk scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition"
            >
              <Radio className="h-4 w-4" />
              Live Radar
            </Link>
            <Link
              href="/risk"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Risk Inspector
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Tokens"
          value="1,482"
          subtitle="Active Pump.fun, Raydium, Meteora"
          icon={Zap}
          highlightColor="cyan"
          trend={{ value: "+124 new / 1h", isPositive: true }}
        />
        <StatCard
          title="Paper Trade Candidates"
          value="14"
          subtitle="Final Score ≥ 75, Risk ≤ 35"
          icon={Flame}
          highlightColor="emerald"
          trend={{ value: "High Win-Rate Setups", isPositive: true }}
        />
        <StatCard
          title="Active Signals"
          value="48"
          subtitle="Actionable momentum alerts"
          icon={Radio}
          highlightColor="purple"
          trend={{ value: "100% Deterministic", isPositive: true }}
        />
        <StatCard
          title="Hard Veto Filtered"
          value="892"
          subtitle="Honeypots, Rugs & Drained Pools"
          icon={AlertTriangle}
          highlightColor="amber"
          trend={{ value: "Zero Tolerance Safety", isPositive: true }}
        />
      </div>

      {/* Main Grid: Live Signals + Quick Screener */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Signal Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Signal Discovery Stream
              </h2>
            </div>

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded font-medium transition ${
                  activeTab === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Signals
              </button>
              <button
                onClick={() => setActiveTab('PAPER')}
                className={`px-3 py-1 rounded font-medium transition ${
                  activeTab === 'PAPER'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paper Trade Only
              </button>
              <button
                onClick={() => setActiveTab('HIGH')}
                className={`px-3 py-1 rounded font-medium transition ${
                  activeTab === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High Priority+
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <SignalFeedCard key={signal.id} signal={signal} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/signals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              <span>View all 48 live signals on radar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Quantitative Engine Status & Safety Invariants */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Quantitative Invariants (V1)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Zero Look-Ahead Bias
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Every score and feature assertion enforces <code className="text-cyan-400">t ≤ T₀</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Hard Veto Protection Layer
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Honeypots, high sell tax, and drained pools unconditionally force <code className="text-rose-400">Decision = IGNORE</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Risk-Adjusted Multiplication
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Final Score = Opportunity × (1 - TotalRisk/100).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <Link
                href="/tokens"
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                Open Token Screener
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
