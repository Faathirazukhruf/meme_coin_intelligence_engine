'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Coins,
  Search,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { DecisionBadge } from '@/components/DecisionBadge';

interface ScreenerToken {
  id: string;
  symbol: string;
  name: string;
  platform: string;
  priceUsd: number;
  priceChange5m: number;
  volume5m: number;
  liquidityUsd: number;
  holderCount: number;
  devRiskScore: number;
  finalScore: number;
  decision: string;
  isVetoed: boolean;
}

const mockTokens: ScreenerToken[] = [
  {
    id: '7EYnhQoR9YM3N7UoaKRoA44PBVfGQxeNFyN579bPump',
    symbol: 'PEPE_SOL',
    name: 'Pepe Solana Original',
    platform: 'Pump.fun',
    priceUsd: 0.0042,
    priceChange5m: 14.5,
    volume5m: 64200,
    liquidityUsd: 125000,
    holderCount: 840,
    devRiskScore: 12,
    finalScore: 88.4,
    decision: 'PAPER_TRADE_CANDIDATE',
    isVetoed: false,
  },
  {
    id: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
    symbol: 'DOGE_AI',
    name: 'Autonomous Doge Agent',
    platform: 'Raydium',
    priceUsd: 0.0185,
    priceChange5m: 8.2,
    volume5m: 42100,
    liquidityUsd: 89000,
    holderCount: 520,
    devRiskScore: 18,
    finalScore: 76.8,
    decision: 'HIGH_PRIORITY',
    isVetoed: false,
  },
  {
    id: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHY36ghBQea8nE',
    symbol: 'QUANTUM',
    name: 'Quantum Engine',
    platform: 'Raydium CPMM',
    priceUsd: 0.034,
    priceChange5m: 22.0,
    volume5m: 51200,
    liquidityUsd: 95000,
    holderCount: 610,
    devRiskScore: 15,
    finalScore: 82.1,
    decision: 'PAPER_TRADE_CANDIDATE',
    isVetoed: false,
  },
  {
    id: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    symbol: 'SOL_CAT',
    name: 'Quantum Kitty',
    platform: 'Pump.fun',
    priceUsd: 0.00085,
    priceChange5m: 4.1,
    volume5m: 21500,
    liquidityUsd: 45000,
    holderCount: 380,
    devRiskScore: 28,
    finalScore: 68.2,
    decision: 'ALERT',
    isVetoed: false,
  },
  {
    id: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'NEO_MEME',
    name: 'Matrix Red Pill',
    platform: 'Meteora DLMM',
    priceUsd: 0.00012,
    priceChange5m: -2.4,
    volume5m: 8500,
    liquidityUsd: 18000,
    holderCount: 190,
    devRiskScore: 35,
    finalScore: 54.1,
    decision: 'WATCH',
    isVetoed: false,
  },
  {
    id: 'BSo1111111111111111111111111111111111111111',
    symbol: 'RUG_TEST',
    name: 'Dumping Dev Token',
    platform: 'Raydium',
    priceUsd: 0.00001,
    priceChange5m: -65.0,
    volume5m: 1200,
    liquidityUsd: 340,
    holderCount: 42,
    devRiskScore: 95,
    finalScore: 0.0,
    decision: 'IGNORE',
    isVetoed: true,
  },
];

export default function TokenScreenerPage() {
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const filteredTokens = mockTokens.filter((t) => {
    if (platformFilter !== 'ALL' && !t.platform.includes(platformFilter)) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Solana Meme Token Screener
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time on-chain metrics across Pump.fun, Raydium, and Meteora pools.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">
            {filteredTokens.length} Tokens Tracked
          </span>
        </div>
      </div>

      {/* Filter Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search token symbol or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1">
            {['ALL', 'Pump.fun', 'Raydium', 'Meteora'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  platformFilter === p
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Token Data Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1420] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 font-medium text-slate-400">
              <tr>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">5m Change</th>
                <th className="px-4 py-3 text-right">5m Volume</th>
                <th className="px-4 py-3 text-right">Liquidity</th>
                <th className="px-4 py-3 text-right">Holders</th>
                <th className="px-4 py-3 text-right">Final Score</th>
                <th className="px-4 py-3 text-center">Decision</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTokens.map((token) => (
                <tr
                  key={token.id}
                  className="hover:bg-slate-900/40 transition group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{token.symbol}</span>
                          {token.isVetoed && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              VETOED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {token.id.slice(0, 4)}...{token.id.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                      {token.platform}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-slate-200">
                    ${token.priceUsd.toFixed(6)}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        token.priceChange5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {token.priceChange5m >= 0 ? '+' : ''}
                      {token.priceChange5m.toFixed(1)}%
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                    ${token.volume5m.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                    ${token.liquidityUsd.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                    {token.holderCount}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-bold text-cyan-400">
                    {token.finalScore.toFixed(1)}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <DecisionBadge decision={token.decision} size="sm" />
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <Link
                      href={`/tokens/${token.id}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
