import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Bot, 
  TrendingDown, 
  AlertTriangle, 
  Flame, 
  Layers, 
  Activity, 
  Zap, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Lock
} from 'lucide-react';
import { InstitutionalTrackerStats, InstitutionalPattern } from '../types';

interface InstitutionalStrategyTrackerProps {
  tracker?: InstitutionalTrackerStats;
  currentPrice: number;
}

export const InstitutionalStrategyTracker: React.FC<InstitutionalStrategyTrackerProps> = ({
  tracker,
  currentPrice
}) => {
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  if (!tracker) {
    return null;
  }

  const togglePattern = (id: string) => {
    setExpandedPatternId(prev => (prev === id ? null : id));
  };

  const getBadgeColor = (level: InstitutionalTrackerStats['dumpThreatLevel']) => {
    switch (level) {
      case 'RISCO CRÍTICO DE DUMP':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'ALERTA ELEVADO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MODERADO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ESTÁVEL / ACUMULAÇÃO':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getThreatBadge = (level: InstitutionalPattern['threatLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MODERATE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div id="institutional-strategy-tracker" className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden font-sans">
      {/* Background glow effect based on threat level */}
      {tracker.dumpProbabilityPercent >= 70 && (
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400">
            <Bot className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                Rastreador de Estratégias Institucionais
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                IA-PRE-DUMP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Identificação algorítmica de grandes volumes fracionados (TWAP), spoofing e acúmulo de shorts antes de fortes quedas.
            </p>
          </div>
        </div>

        <div className="self-start sm:self-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${getBadgeColor(tracker.dumpThreatLevel)}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {tracker.dumpThreatLevel}
          </span>
        </div>
      </div>

      {/* Main Threat Probability Meter & Sensor Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dump Probability Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Probabilidade de Queda Acentuada
            </span>
            <span className="text-slate-500 text-[10px]">Horizonte: 1h - 12h</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-extrabold tracking-tight ${
                tracker.dumpProbabilityPercent >= 70 ? 'text-rose-400' :
                tracker.dumpProbabilityPercent >= 45 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {tracker.dumpProbabilityPercent}%
              </span>
              <span className="text-xs text-slate-400 font-sans">
                {tracker.dumpProbabilityPercent >= 75 ? 'Risco Iminente' :
                 tracker.dumpProbabilityPercent >= 50 ? 'Presença de Vendas' : 'Acúmulo Estável'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  tracker.dumpProbabilityPercent >= 70 ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
                  tracker.dumpProbabilityPercent >= 45 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${tracker.dumpProbabilityPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed border-t border-slate-800/60 pt-2">
            {tracker.dumpProbabilityPercent >= 70 
              ? 'Algoritmos quantitativos estão desovando grande volume no suporte enquanto montam posições vendidas em derivativos.' 
              : 'Fluxo sem indicações de desova maciça imediata por parte de fundos institucionais.'}
          </p>
        </div>

        {/* 4 Sensor Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          {/* Sensor 1: Vendas TWAP */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block truncate">1. Volume TWAP Furtivo</span>
            <span className="text-base font-bold text-slate-100 block">
              {(tracker.stealthSellingVolume24hEth / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">ETH</span>
            </span>
            <span className="text-[10px] text-rose-400 block truncate">
              ${((tracker.stealthSellingVolume24hEth * currentPrice) / 1_000_000).toFixed(1)}M desovados
            </span>
          </div>

          {/* Sensor 2: Paredão Iceberg */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block truncate">2. Barreira Iceberg (Ask)</span>
            <span className="text-base font-bold text-slate-100 block">
              {(tracker.icebergSellWallEth / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">ETH</span>
            </span>
            <span className="text-[10px] text-amber-400 block truncate">
              Trava em topo de canal
            </span>
          </div>

          {/* Sensor 3: Open Interest Shorts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block truncate">3. Short OI Divergence</span>
            <span className={`text-base font-bold block ${tracker.openInterestDivergenceScore > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {tracker.openInterestDivergenceScore > 0 ? '+' : ''}{tracker.openInterestDivergenceScore}%
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              Entrada em Futuros
            </span>
          </div>

          {/* Sensor 4: Spike de Inflow */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block truncate">4. Spike Inflow Corretoras</span>
            <span className="text-base font-bold text-slate-100 block">
              {tracker.exchangeInflowSpikeRatio}x
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              Média mensal de depósitos
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Banner */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
        tracker.dumpProbabilityPercent >= 70
          ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          : 'bg-slate-900/90 border-slate-800 text-slate-300'
      }`}>
        <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${
          tracker.dumpProbabilityPercent >= 70 ? 'text-rose-400 animate-bounce' : 'text-blue-400'
        }`} />
        <div>
          <strong className="font-bold text-slate-100 block mb-0.5">
            RECOMENDAÇÃO DE PROTEÇÃO INSTITUCIONAL:
          </strong>
          {tracker.recommendation}
        </div>
      </div>

      {/* Active Detected Patterns List */}
      <div className="space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Estratégias Institucionais Detectadas em Tempo Real ({tracker.activePatterns.length})
          </span>
          <span className="text-[10px] text-slate-500">
            Atualizado a cada 15s via leilões de arbitragem
          </span>
        </div>

        <div className="space-y-2.5">
          {tracker.activePatterns.map((pattern) => {
            const isExpanded = expandedPatternId === pattern.id;

            return (
              <div
                key={pattern.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-xl transition-all hover:border-slate-700/80 overflow-hidden"
              >
                <div
                  onClick={() => togglePattern(pattern.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400">
                      <Flame className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 font-sans">
                          {pattern.name}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${getThreatBadge(pattern.threatLevel)}`}>
                          {pattern.threatLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Volume Envolvido: <strong className="text-slate-200">{pattern.volumeInvolvedEth.toLocaleString('pt-BR')} ETH</strong> (${(pattern.volumeInvolvedUsd / 1_000_000).toFixed(1)}M) • Detectado: {pattern.detectedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 uppercase block">Risco de Dump</span>
                      <span className="text-xs font-bold text-rose-400">
                        {pattern.probabilityOfDumpPercent}%
                      </span>
                    </div>
                    <button className="p-1 rounded text-slate-400 hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/50 space-y-3 text-xs font-sans">
                    <p className="text-slate-300 leading-relaxed">
                      {pattern.description}
                    </p>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-mono">
                        Indicadores Táticos Confirmados:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pattern.keyIndicators.map((ind, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
