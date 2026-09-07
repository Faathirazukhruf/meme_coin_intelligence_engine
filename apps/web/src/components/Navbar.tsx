'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Coins,
  ShieldCheck,
  History,
  Activity,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/signals', label: 'Live Signals', icon: Radio },
    { href: '/tokens', label: 'Token Screener', icon: Coins },
    { href: '/risk', label: 'Risk & Veto Radar', icon: ShieldCheck },
    { href: '/backtest', label: 'Backtest Studio', icon: History },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0e1420]/95 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-[#0b0f17] rounded-[7px] flex items-center justify-center font-bold text-cyan-400 text-xs">
                MC
              </div>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                MEME INTEL ENGINE
              </span>
              <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                Solana V1
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Heartbeat & Metrics */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>SOLANA FEED ACTIVE</span>
          </div>

          <div className="text-slate-400 text-[11px] hidden lg:block">
            MATH FIRST → AI SECOND
          </div>
        </div>
      </div>
    </header>
  );
}
