import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meme Coin Intelligence Engine',
  description: 'On-chain Meme Discovery, Risk & Opportunity Intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f17] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <header className="border-b border-slate-800 bg-[#0e1420] px-4 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                MEME INTEL ENGINE
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Solana V1
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Math First → AI Second
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
