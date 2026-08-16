import React from 'react';
import { Activity, Bell, RefreshCw, Sliders, ShieldCheck, Zap, Terminal } from 'lucide-react';
import { ScenarioPreset } from '../types';

interface HeaderProps {
  scenario: ScenarioPreset;
  onScenarioChange: (scenario: ScenarioPreset) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  hasUnreadAlerts: boolean;
  onOpenAlerts: () => void;
  onOpenDebug: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  onScenarioChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
  hasUnreadAlerts,
  onOpenAlerts,
  onOpenDebug
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0C10]/95 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-bold text-slate-200 tracking-[0.15em] font-mono uppercase">
                  Ethereum Intelligence <span className="text-blue-400 font-sans">System</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  Institutional v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider hidden sm:block mt-0.5">
                Real-time Confluence Engine • On-Chain Telemetry • ETF Flows
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenDebug}
              className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              title="Debug Console"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Alertas"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Controls & Scenario Tester */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Scenario Selector */}
          <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/60 text-xs">
            <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px] pl-2 hidden lg:inline flex items-center gap-1">
              <Sliders className="w-3 h-3 text-blue-400" /> Cenário:
            </span>
            <select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioPreset)}
              className="bg-slate-900 text-slate-300 rounded-lg px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-blue-500/50 border border-slate-800 cursor-pointer"
            >
              <option value="live">🟢 Ao Vivo (Real-time)</option>
              <option value="neutral_wait">🟡 Modo Neutro (Neutral Wait)</option>
              <option value="bullish_surge">🚀 Sinal Compra (Confluência Alta)</option>
              <option value="bearish_dump">🔴 Sinal Venda (Pressão Vendedora)</option>
              <option value="whale_panic">🐋 Pânico & Compra de Baleias</option>
            </select>
          </div>

          {/* Desktop Refresh & Status */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-800/60">
            <div className="text-right font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-green-400 uppercase tracking-widest font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                AUTO-SYNC (10s)
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Atualizado: {lastUpdated}</p>
            </div>

            <button
              onClick={onOpenDebug}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono tracking-wider uppercase transition-all"
              title="Abrir Console de Debugging Quanti-Sistemático"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Debug Console</span>
            </button>

            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-xl bg-slate-900/30 border border-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
              title="Alertas"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-mono tracking-wider uppercase transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

