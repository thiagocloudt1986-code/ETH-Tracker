import React from 'react';
import { History, CheckCircle, XCircle, TrendingUp, Percent, Shield, ArrowUpRight } from 'lucide-react';
import { BacktestSignalRecord } from '../types';

interface BacktestSimulatorProps {
  records: BacktestSignalRecord[];
}

export const BacktestSimulator: React.FC<BacktestSimulatorProps> = ({ records }) => {
  const wins = records.filter((r) => r.isWin).length;
  const winRate = ((wins / records.length) * 100).toFixed(1);
  const avgReturn = (records.reduce((acc, r) => acc + r.returnPercent, 0) / records.length).toFixed(2);

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" /> Backtest & Historical Signals (30D)
        </h3>
        <span className="text-[10px] text-slate-500 uppercase">
          WIN RATE: {winRate}%
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-[10px] text-slate-500 uppercase block">Win Rate</span>
          <span className="text-xl font-light text-green-400">{winRate}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-[10px] text-slate-500 uppercase block">Avg Return</span>
          <span className="text-xl font-light text-blue-400">+{avgReturn}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-[10px] text-slate-500 uppercase block">Max Drawdown</span>
          <span className="text-xl font-light text-rose-400">-2.19%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-[10px] text-slate-500 uppercase block">Frequency</span>
          <span className="text-xl font-light text-slate-300">2-4 / day</span>
        </div>
      </div>

      {/* Signal Log Table */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          Recent Closed Executions
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-500 text-[10px] uppercase">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Entry</th>
                <th className="py-2">Exit</th>
                <th className="py-2">Score</th>
                <th className="py-2 text-right">Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/20">
                  <td className="py-2.5 text-slate-400">{r.date}</td>
                  <td className="py-2.5 font-bold">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        r.type === 'BUY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">${r.entryPrice}</td>
                  <td className="py-2.5 text-slate-300">${r.exitPrice}</td>
                  <td className="py-2.5 text-blue-400 font-semibold">{r.confluenceScore}</td>
                  <td className={`py-2.5 text-right font-medium ${r.isWin ? 'text-green-400' : 'text-rose-400'}`}>
                    {r.returnPercent > 0 ? '+' : ''}{r.returnPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
