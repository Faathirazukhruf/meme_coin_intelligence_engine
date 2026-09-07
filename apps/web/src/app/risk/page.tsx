'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Flame,
  Zap,
} from 'lucide-react';
import { RiskBreakdownBar } from '@/components/RiskBreakdownBar';

export default function RiskInspectorPage() {
  const [inputAddress, setInputAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAddress.trim()) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Determine simulated scan based on input
      const isRug = inputAddress.toLowerCase().includes('rug') || inputAddress.startsWith('B');
      if (isRug) {
        setScanResult({
          address: inputAddress,
          symbol: 'RUG_SUSPECT',
          isVetoed: true,
          vetoReason: 'DRAINED_LIQUIDITY & UNSELLABLE_TAX',
          totalRiskScore: 92.5,
          risk: {
            liquidityRisk: 95,
            holderRisk: 90,
            devRisk: 95,
            walletRisk: 88,
            marketStructureRisk: 85,
            contractRisk: 90,
            totalRiskScore: 92.5,
          },
          checks: [
            { name: 'Honeypot / Simulation Sell Test', passed: false, detail: 'Failed sell simulation with 99% slippage' },
            { name: 'Transfer Tax Bounds', passed: false, detail: 'Dynamic sell tax detected > 25%' },
            { name: 'Liquidity Floor ($500 minimum)', passed: false, detail: 'Pool liquidity < $340 USD' },
            { name: 'Mint & Freeze Authorities', passed: false, detail: 'Freeze authority active on creator key' },
            { name: 'Dev Dumping Activity', passed: false, detail: 'Dev sold 85% of creator allocation in first 3 mins' },
          ],
        });
      } else {
        setScanResult({
          address: inputAddress,
          symbol: 'VERIFIED_MINT',
          isVetoed: false,
          vetoReason: null,
          totalRiskScore: 16.4,
          risk: {
            liquidityRisk: 15,
            holderRisk: 22,
            devRisk: 12,
            walletRisk: 14,
            marketStructureRisk: 18,
            contractRisk: 10,
            totalRiskScore: 16.4,
          },
          checks: [
            { name: 'Honeypot / Simulation Sell Test', passed: true, detail: 'Passed clean sell simulation (0% tax)' },
            { name: 'Transfer Tax Bounds', passed: true, detail: '0% buy / 0% sell tax verified' },
            { name: 'Liquidity Floor ($500 minimum)', passed: true, detail: 'Pool depth > $95,000 USD' },
            { name: 'Mint & Freeze Authorities', passed: true, detail: 'Mint revoked & Freeze revoked' },
            { name: 'Dev Dumping Activity', passed: true, detail: 'Creator holds < 2% with 0 sell transactions' },
          ],
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Hard Veto & Quantitative Risk Inspector
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Instant on-chain honeypot validation, transfer tax auditor, and multi-factor risk decomposition.
        </p>
      </div>

      {/* Contract Search / Inspector Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Paste any Solana mint address (e.g. 7EYnhQoR... or test with BSo11111111... for rug test)"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !inputAddress.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition shadow-md shadow-cyan-500/20"
          >
            {isScanning ? (
              <span>Auditing On-chain...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Audit Contract</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {scanResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Alert Banner */}
          {scanResult.isVetoed ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-rose-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wide">
                    HARD VETO TRIGGERED: {scanResult.vetoReason}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    This token failed non-negotiable quantitative safety invariants. The engine classifies this asset as <code className="text-rose-400 font-bold">Decision = IGNORE</code> with zero opportunity score permitted.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                    PASSED ALL HARD VETO INVARIANTS
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    No honeypot mechanisms, mint authorities, or liquidity drains detected. Asset is eligible for momentum scoring.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2-Col Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist */}
            <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Safety Invariant Checklist
              </h3>
              <div className="space-y-3">
                {scanResult.checks.map((check: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80"
                  >
                    <div className="flex items-start gap-2.5">
                      {check.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {check.name}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {check.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Decomposition Bar */}
            <div className="rounded-xl border border-slate-800 bg-[#0e1420] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Multi-Vector Risk Breakdown
              </h3>
              <RiskBreakdownBar risk={scanResult.risk} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
