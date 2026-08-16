import React, { useState, useEffect } from 'react';
import { X, Terminal, Cpu, Activity, RefreshCw, Filter, Layers, AlertCircle, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { ConfluenceSignal, EthMarketData } from '../types';

interface DebugConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: ConfluenceSignal;
  market: EthMarketData;
  scenario: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  score: number;
  price: number;
  status: string;
  category: 'system' | 'score_change' | 'veto' | 'tick';
  message: string;
}

export const DebugConsoleModal: React.FC<DebugConsoleModalProps> = ({
  isOpen,
  onClose,
  signal,
  market,
  scenario
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'score_change' | 'veto'>('all');
  const [copied, setCopied] = useState(false);

  // Maintain a tick history whenever signal or market updates
  useEffect(() => {
    if (!market) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString();

    const tech = signal.factors.find((f) => f.category === 'technical')?.score ?? 50;
    const onchain = signal.factors.find((f) => f.category === 'onchain')?.score ?? 50;
    const inst = signal.factors.find((f) => f.category === 'institutional')?.score ?? 50;
    const sent = signal.factors.find((f) => f.category === 'sentiment')?.score ?? 50;

    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      score: signal.totalScore,
      price: market.price,
      status: signal.status,
      category: signal.isRiskRewardFilterVetoed
        ? 'veto'
        : 'tick',
      message: `[TICK] Price: $${market.price.toFixed(2)} | Score: ${signal.totalScore}/100 (Tec:${tech} | OnC:${onchain} | Inst:${inst} | Sen:${sent}) | Status: ${signal.status}`
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  }, [market?.lastUpdated, signal?.totalScore, signal?.status, market?.price]);

  if (!isOpen) return null;

  const techFactor = signal.factors.find((f) => f.category === 'technical');
  const onchainFactor = signal.factors.find((f) => f.category === 'onchain');
  const instFactor = signal.factors.find((f) => f.category === 'institutional');
  const sentFactor = signal.factors.find((f) => f.category === 'sentiment');

  const factorsList = [
    { label: 'Técnico & Derivados (20%)', category: 'technical', factor: techFactor, icon: '📈' },
    { label: 'Dados On-Chain & TVL (20%)', category: 'onchain', factor: onchainFactor, icon: '⛓️' },
    { label: 'Fluxo Institucional & ETFs (30%)', category: 'institutional', factor: instFactor, icon: '🏛️' },
    { label: 'Sentimento & Notícias Globais (30%)', category: 'sentiment', factor: sentFactor, icon: '🧠' }
  ];

  const filteredLogs = logs.filter((log) => {
    if (filterCategory === 'score_change') return log.category === 'score_change' || log.score >= 75 || log.score <= 25;
    if (filterCategory === 'veto') return log.category === 'veto';
    return true;
  });

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Console de Auditoria e Debug Quanti-Sistemático
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-semibold">
                  LIVE ENGINE LOGS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Auditoria em tempo real da matriz de pesos, sub-indicadores e razões de estagnação/variação do score.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Top Engine Diagnostic Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Score Confluência Total</span>
              <span className="text-2xl font-bold text-blue-400 mt-1 block">
                {signal.totalScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Pesos: ETF (30%) + Notícias (30%) + Técnico (20%) + On-Chain (20%) + Sinergia</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status de Decisão</span>
              <span
                className={`text-sm font-bold mt-1 block ${
                  signal.status === 'BUY'
                    ? 'text-emerald-400'
                    : signal.status === 'SELL'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {signal.status === 'BUY' ? '🟢 COMPRA (LONG)' : signal.status === 'SELL' ? '🔴 VENDA (SHORT)' : '🟡 NEUTRO (WAIT)'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Gatilho: Compra ≥ 75 | Venda ≤ 25</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Filtro de Risco / Veto</span>
              <span
                className={`text-xs font-bold mt-1 block ${
                  signal.isRiskRewardFilterVetoed ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {signal.isRiskRewardFilterVetoed ? '⚠️ VETO ATIVO (R/R Abaixo)' : '✅ APROVADO'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                R/R: {signal.riskRewardRatio ?? 'N/A'}x | Min: 1.5x
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Volatilidade ATR(14)</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                ${market.atr14?.toFixed(2) || (market.price * 0.024).toFixed(2)} USD
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Stop: 1.5x ATR | Alvo: 2.6x ATR</span>
            </div>
          </div>

          {/* Sub-Indicators Detailed Weight Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                1. Decomposição dos 4 Sub-Indicadores e Contribuição Ponderada
              </h3>
              <span className="text-[11px] text-slate-400">Peso Fixo: 25.0% por pilar</span>
            </div>

            <div className="space-y-2.5">
              {factorsList.map(({ label, factor, icon }) => {
                const score = factor?.score ?? 50;
                const weightedPoints = (score * 0.25).toFixed(2);
                const status = factor?.status || 'neutral';

                return (
                  <div
                    key={label}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <div>
                          <span className="font-bold text-slate-200">{label}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{factor?.value}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase block">Score Bruto</span>
                          <span className="font-bold text-white text-xs">{score} / 100</span>
                        </div>
                        <div className="text-right pl-3 border-l border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase block">Contribuição (+Pts)</span>
                          <span className="font-bold text-emerald-400 text-xs">+{weightedPoints} pts</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            status === 'bullish'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : status === 'bearish'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 65 ? 'bg-emerald-500' : score <= 35 ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Reason / Explanation */}
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <strong>Causa do Score:</strong> {factor?.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Formula & Stagnation Diagnostic Rule */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              2. Diagnóstico de Estagnação x Variação do Score
            </h3>
            <div className="text-[11px] text-slate-300 leading-relaxed space-y-1 font-sans">
              <p>
                • <strong>Por que o score varia?</strong> Quando ocorre entrada substancial de volume nos ETFs (Institucional), baleias retiram ETH para carteiras privadas (On-chain) ou o RSI atinge sobrevenda (Técnico), o score sobe na próxima sincronização de 10s.
              </p>
              <p>
                • <strong>Por que o score pode parecer estagnado?</strong> Se os 4 pilares estiverem em forças opostas (ex: Técnico Bullish em 80, mas On-chain Bearish em 20), a média aritmética ponderada resulta em <strong>50/100 (Neutro)</strong>. O algoritmo exige divergência ampla a favor para romper a faixa neutra de 26-74.
              </p>
            </div>
          </div>

          {/* Real-time Ticks Audit Console */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                3. Console de Logs de Ticks do Motor ({filteredLogs.length} entradas)
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2 py-0.5 rounded ${
                      filterCategory === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterCategory('score_change')}
                    className={`px-2 py-0.5 rounded ${
                      filterCategory === 'score_change' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sinais Ativos
                  </button>
                  <button
                    onClick={() => setFilterCategory('veto')}
                    className={`px-2 py-0.5 rounded ${
                      filterCategory === 'veto' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vetos de Risco
                  </button>
                </div>

                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Logs'}</span>
                </button>
              </div>
            </div>

            <div className="bg-[#05070c] border border-slate-800 rounded-xl p-3 font-mono text-[11px] h-48 overflow-y-auto space-y-1.5 leading-relaxed">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 p-1 rounded">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`shrink-0 ${
                        log.category === 'veto'
                          ? 'text-amber-400'
                          : log.score >= 75
                          ? 'text-emerald-400 font-bold'
                          : log.score <= 25
                          ? 'text-rose-400 font-bold'
                          : 'text-blue-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">Nenhum log registrado para este filtro no momento.</p>
              )}
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Sistemas Ativos: <strong>4 Sub-indicadores @ 25% Cada</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
          >
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};
