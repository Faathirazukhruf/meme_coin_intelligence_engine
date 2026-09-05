export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-[#131b2c] border border-slate-800 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          On-chain Meme Discovery, Risk &amp; Opportunity Intelligence
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Quantitative meme coin research engine measuring market structure, holder velocity, liquidity behavior, 
          and cluster concentration. Deterministic scoring with zero look-ahead bias.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#131b2c] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-400">Tracked Tokens</div>
          <div className="text-2xl font-bold text-white mt-1">--</div>
          <div className="text-xs text-slate-500 mt-1">Solana Active Pools</div>
        </div>
        <div className="bg-[#131b2c] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-400">Active Signals</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">--</div>
          <div className="text-xs text-slate-500 mt-1">Passing Hard Veto</div>
        </div>
        <div className="bg-[#131b2c] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-400">Engine Status</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">READY</div>
          <div className="text-xs text-slate-500 mt-1">Phase 1 Foundation</div>
        </div>
        <div className="bg-[#131b2c] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-400">Scoring Version</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">v1.0</div>
          <div className="text-xs text-slate-500 mt-1">Deterministic weights</div>
        </div>
      </div>

      {/* Quick Navigation / Philosophy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#131b2c] border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-2">Core Principles</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Math First → AI Second:</strong> Quantitative metrics drive decisions.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Anti-Look-Ahead:</strong> Features at $T_0$ use only data $\le T_0$.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Hard Veto Layer:</strong> Rugs &amp; honeypots are vetoed unconditionally.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#131b2c] border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-2">Fastify API Status</h2>
          <div className="text-sm text-slate-300 space-y-2">
            <p>API service running on port 4000.</p>
            <p className="font-mono text-xs text-cyan-400 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              GET /health &bull; GET /api/v1/tokens &bull; GET /api/v1/signals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
