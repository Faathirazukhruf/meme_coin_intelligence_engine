'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Lock,
  Wallet,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { DecisionBadge } from '@/components/DecisionBadge';
import { RiskBreakdownBar } from '@/components/RiskBreakdownBar';
import { OpportunityBreakdownBar } from '@/components/OpportunityBreakdownBar';

export default function TokenDeepDivePage({
  params,
}: {
  params: { address: string };
}) {
  const address = params.address || '7EYnhQoR9YM3N7UoaKRoA44PBVfGQxeNFyN579bPump';

  // Mock token deep-dive data
  const token = {
    id: address,
    symbol: 'PEPE_SOL',
    name: 'Pepe Solana Original',
    platform: 'Pump.fun',
    priceUsd: 0.0042,
    marketCapUsd: 4200000,
    liquidityUsd: 125000,
    volume24h: 890000,
    volume5m: 64200,
    holderCount: 840,
    finalScore: 88.4,
    decision: 'PAPER_TRADE_CANDIDATE',
    confidenceScore: 94.0,
    reason:
      'High volume acceleration (+340%) + zero dev dumping + organic holder onboarding + clean pool liquidity ratio (0.15)',
    risk: {
      liquidityRisk: 14.5,
      holderRisk: 18.0,
      devRisk: 8.5,
      walletRisk: 12.0,
      marketStructureRisk: 15.0,
      contractRisk: 10.0,
      totalRiskScore: 13.2,
    },
    opportunity: {
      marketMomentum: 92.0,
      volumeMomentum: 95.0,
      liquidityMomentum: 84.0,
      holderMomentum: 90.0,
      socialMomentum: 72.0,
      narrativeMomentum: 80.0,
      totalOpportunityScore: 88.5,
    },
    walletDev: {
      creatorRatio: 0.015,
      devSellPressure: 0.0,
      clusterConcentration: 0.06,
      top10Concentration: 0.18,
      top20Concentration: 0.28,
    },
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/tokens"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Screener</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Anti-Look-Ahead Asserted (t ≤ T₀)
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1420] p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center font-bold text-cyan-400 text-lg">
                {token.symbol.slice(0, 3)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {token.symbol}
                </h1>
                <DecisionBadge decision={token.decision} size="lg" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{token.name}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-500">{token.id}</span>
                <a
                  href={`https://solscan.io/token/${token.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-cyan-400"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Final Score</span>
              <span className="text-2xl font-mono font-black text-cyan-400">
                {token.finalScore.toFixed(1)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
              <span className="text-2xl font-mono font-black text-purple-400">
                {token.confidenceScore.toFixed(0)}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Price</span>
              <span className="text-xl font-mono font-bold text-white">
                ${token.priceUsd.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative Explainability Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Deterministic Decision Explanation (PRD Section 23)
            </span>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {token.reason}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Deep Breakdown: Risk Decomposition vs Momentum Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Quantitative Risk Decomposition */}
        <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Risk Engine Decomposition (PRD Section 18)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Lower is safer
            </span>
          </div>

          <RiskBreakdownBar risk={token.risk} />

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Creator Balance Ratio</span>
              <span className="font-mono font-semibold text-emerald-400">
                {(token.walletDev.creatorRatio * 100).toFixed(1)}% (Low Risk)
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Top 10 Holder Concentration</span>
              <span className="font-mono font-semibold text-emerald-400">
                {(token.walletDev.top10Concentration * 100).toFixed(1)}% (Dispersed)
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Cluster Co-funding Risk</span>
              <span className="font-mono font-semibold text-emerald-400">
                {(token.walletDev.clusterConcentration * 100).toFixed(1)}% (Safe)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Opportunity & Momentum Drivers */}
        <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Opportunity Momentum Drivers (PRD Section 19)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Higher is stronger
            </span>
          </div>

          <OpportunityBreakdownBar opportunity={token.opportunity} />

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">5-Minute Volume</span>
              <span className="font-mono font-semibold text-cyan-400">
                ${token.volume5m.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Total Liquidity Pool</span>
              <span className="font-mono font-semibold text-cyan-400">
                ${token.liquidityUsd.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Unique On-chain Holders</span>
              <span className="font-mono font-semibold text-emerald-400">
                {token.holderCount} addresses
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
