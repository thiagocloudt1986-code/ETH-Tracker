import React from 'react';
import { Landmark, TrendingUp, TrendingDown, BookOpen, Building, ShieldCheck, PieChart } from 'lucide-react';
import { InstitutionalStats } from '../types';

interface InstitutionalEtfModuleProps {
  institutional: InstitutionalStats;
}

export const InstitutionalEtfModule: React.FC<InstitutionalEtfModuleProps> = ({ institutional }) => {
  const flowTodayM = (institutional.etfNetFlowTodayUsd / 1_000_000).toFixed(1);
  const flow7dM = (institutional.etfNetFlow7dUsd / 1_000_000).toFixed(1);

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-5">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 font-mono">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
          <Landmark className="w-4 h-4 text-blue-400" /> Institutional ETF Flows
        </h3>
        <span className="text-[10px] text-slate-500 uppercase">
          NASDAQ CORR: {(institutional.nasdaqCorrelation * 100).toFixed(0)}%
        </span>
      </div>

      {/* ETF Flow Highlights */}
      <div className="grid grid-cols-2 gap-4 font-mono">
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Today Net Flow</span>
          <span
            className={`text-2xl font-light tracking-tight ${
              institutional.etfNetFlowTodayUsd >= 0 ? 'text-green-400' : 'text-rose-400'
            }`}
          >
            {institutional.etfNetFlowTodayUsd >= 0 ? '+' : ''}${flowTodayM}M
          </span>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">7D Cumulative</span>
          <span
            className={`text-2xl font-light tracking-tight ${
              institutional.etfNetFlow7dUsd >= 0 ? 'text-green-400' : 'text-rose-400'
            }`}
          >
            {institutional.etfNetFlow7dUsd >= 0 ? '+' : ''}${flow7dM}M
          </span>
        </div>
      </div>

      {/* ETF Funds Table */}
      <div className="space-y-3 font-mono">
        <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          Institutional Holdings breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-500 text-[10px] uppercase">
                <th className="py-2">Fund / Ticker</th>
                <th className="py-2">Provider</th>
                <th className="py-2">ETH Holdings</th>
                <th className="py-2 text-right">24h Net Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {institutional.etfFunds.map((f) => {
                const flowM = (f.flow24hUsd / 1_000_000).toFixed(1);
                const isPos = f.flow24hUsd >= 0;

                return (
                  <tr key={f.ticker} className="hover:bg-slate-800/20">
                    <td className="py-2.5 font-semibold text-slate-200">
                      {f.fundName} <span className="text-blue-400 font-normal">({f.ticker})</span>
                    </td>
                    <td className="py-2.5 text-slate-400">{f.provider}</td>
                    <td className="py-2.5 text-slate-300">
                      {(f.holdingsEth / 1000).toFixed(1)}k ETH
                    </td>
                    <td className={`py-2.5 text-right font-medium ${isPos ? 'text-green-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}${flowM}M
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
