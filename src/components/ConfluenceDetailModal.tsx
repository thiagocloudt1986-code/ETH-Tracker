import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { ConfluenceSignal, ConfluenceFactor } from '../types';

interface ConfluenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: ConfluenceSignal;
}

export const ConfluenceDetailModal: React.FC<ConfluenceDetailModalProps> = ({ isOpen, onClose, signal }) => {
  if (!isOpen) return null;

  const categoryNames = {
    technical: '1. Técnico & Derivados (20%)',
    onchain: '2. Dados On-Chain & TVL (20%)',
    institutional: '3. Fluxo Institucional & ETFs (30%)',
    sentiment: '4. Sentimento & Notícias Globais (30%)'
  };

  const categoryIcons = {
    technical: '📈',
    onchain: '⛓️',
    institutional: '🏛️',
    sentiment: '🧠'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">
              Detalhamento da Matriz de Confluência ({signal.totalScore}/100)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          {/* Top Score Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Regra de Emissão de Sinal (PRD)</span>
              <p className="text-slate-200 text-xs mt-0.5">
                Exige pontuação ≥ 75 em confluência simultânea para liberação do sinal.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Status Atual</span>
                <span className={`text-sm font-bold ${signal.status === 'BUY' ? 'text-emerald-400' : signal.status === 'SELL' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {signal.status} ({signal.totalScore}/100)
                </span>
              </div>
            </div>
          </div>

          {/* Pillars List */}
          <div className="space-y-4">
            {signal.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{categoryIcons[factor.category]}</span>
                    <h3 className="text-sm font-bold text-slate-200 font-mono">
                      {categoryNames[factor.category]}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-slate-400">{factor.value}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        factor.status === 'bullish'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : factor.status === 'bearish'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {factor.score}/100
                    </span>
                  </div>
                </div>

                {/* Progress bar per pillar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full ${
                      factor.score >= 65 ? 'bg-emerald-500' : factor.score <= 35 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed">
                  {factor.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Mathematical Confluence Explanation */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 font-mono text-[11px] text-indigo-300 leading-relaxed space-y-1.5">
            <p className="font-bold uppercase tracking-wider text-indigo-200">
              💡 Como a Matemática do Sinal e Volatilidade ATR Funciona:
            </p>
            <p>
              <strong>Score Total (Expansão de Alta Convicção até 100):</strong> (ETFs 30%) + (Notícias 30%) + (Técnico 20%) + (On-Chain 20%) com Amplificador de Sinergia de Alta Convicção para cenários de forte tendência.
            </p>
            <p className="pt-1 border-t border-indigo-500/20 text-indigo-300">
              <strong>Gestão Dinâmica de Saída (ATR Volatility Model):</strong> Níveis de Alvo e Stop são imunes a ruídos estáticos, calculados dinamicamente via 14-period Average True Range (Stop Loss = 1.5x ATR, Alvo = 2.6x ATR).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors font-mono"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
