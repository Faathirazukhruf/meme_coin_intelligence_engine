import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Meme Coin Intelligence Engine | Solana V1',
  description: 'Deterministic On-chain Signals, Risk Veto, Opportunity Momentum & Research Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f17] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
