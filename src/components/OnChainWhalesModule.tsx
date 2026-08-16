import React from 'react';
import { Database, Fuel, ArrowUpRight, ArrowDownLeft, RefreshCcw, DollarSign, Layers } from 'lucide-react';
import { DeFiStats, WhaleAlert, EthMarketData } from '../types';

interface OnChainWhalesModuleProps {
  market: EthMarketData;
  defi: DeFiStats;
  whales: WhaleAlert[];
}

export const OnChainWhalesModule: React.FC<OnChainWhalesModuleProps> = ({ market, defi, whales }) => {
  const stableFlowM = (defi.stablecoinFlow24hUsd / 1_000_000).toFixed(1);
  const isPositiveFlow = defi.stablecoinFlow24hUsd >= 0;

  // Gas status badge
  const getGasBadge = (gwei: number) => {
    if (gwei < 20) return { label: 'Baixo / Ideal (< 20)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (gwei <= 50) return { label: 'Normal (20-50)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Elevado (> 50)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const gasInfo = getGasBadge(market.gasPriceGwei);

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-6">
      {/* Module Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 font-mono">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" /> On-Chain Telemetry & Whales
        </h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">
          {market.gasPriceGwei} GWEI • STABLE NETWORK
        </span>
      </div>

      {/* On-Chain Health & Flow Cards */}
      <div className="grid grid-cols-2 gap-4 font-mono">
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">On-Chain Health</h4>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 uppercase">TVL</span>
              <span className="text-[11px] font-semibold text-slate-200">${(defi.tvlUsd / 1e9).toFixed(1)}B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 uppercase">Stables</span>
              <span className={`text-[11px] font-semibold ${isPositiveFlow ? 'text-green-400' : 'text-rose-400'}`}>
                {isPositiveFlow ? '+' : ''}${stableFlowM}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 uppercase">Gas</span>
              <span className="text-[11px] font-semibold text-blue-400">{market.gasPriceGwei} Gwei</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Top DeFi Dominance</h4>
          <div className="space-y-2.5">
            {defi.topProtocols.slice(0, 3).map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 truncate max-w-[80px]">{p.name}</span>
                <span className="font-semibold text-slate-300">${(p.tvlUsd / 1e9).toFixed(1)}B</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Whale Alerts List */}
      <div className="space-y-3 font-mono">
        <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex justify-between">
          <span>High Impact Whale Transfers</span>
          <span className="text-blue-400">• Live</span>
        </h4>

        <div className="space-y-2">
          {whales.map((w) => {
            const isBullish = w.direction === 'exchange_to_wallet';
            const isBearish = w.direction === 'wallet_to_exchange';

            return (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/50 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1 h-8 rounded-full ${
                      isBullish ? 'bg-green-500' : isBearish ? 'bg-rose-500' : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      {w.amountEth.toLocaleString()} ETH (${(w.amountUsd / 1e6).toFixed(1)}M)
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {w.fromLabel} → {w.toLabel}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    isBullish
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : isBearish
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isBullish ? 'ACCUMULATION' : isBearish ? 'DEPOSIT' : 'INTERNAL'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
