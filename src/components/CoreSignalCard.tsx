import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ShieldAlert, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Zap, 
  Target, 
  CheckCircle2, 
  Layers,
  Activity,
  Terminal
} from 'lucide-react';
import { EthMarketData, ConfluenceSignal } from '../types';

interface CoreSignalCardProps {
  market: EthMarketData;
  signal: ConfluenceSignal;
  onOpenDetails: () => void;
  onOpenDebug?: () => void;
}

export const CoreSignalCard: React.FC<CoreSignalCardProps> = ({ market, signal, onOpenDetails, onOpenDebug }) => {
  const [showRationale, setShowRationale] = useState(true);

  const isNeutral = signal.status === 'NEUTRAL';
  const isBuy = signal.status === 'BUY';
  const isSell = signal.status === 'SELL';

  // Progress bar color according to score
  const getScoreBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (score <= 25) return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
    if (score >= 60) return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    return 'bg-amber-500/80';
  };

  const getScoreText = (score: number) => {
    if (score >= 75) return 'RECOMENDAÇÃO: COMPRA (LONG)';
    if (score <= 25) return 'RECOMENDAÇÃO: VENDA (SHORT)';
    if (score >= 55) return 'ESTRUTURA COMPRADORA EM FORMAÇÃO';
    return 'MODO NEUTRO • AGUARDANDO CONFLUÊNCIA';
  };

  // Find individual factor scores for the rational formula
  const techFactor = signal.factors.find((f) => f.category === 'technical')?.score ?? 50;
  const onchainFactor = signal.factors.find((f) => f.category === 'onchain')?.score ?? 50;
  const instFactor = signal.factors.find((f) => f.category === 'institutional')?.score ?? 50;
  const sentFactor = signal.factors.find((f) => f.category === 'sentiment')?.score ?? 50;

  return (
    <div className="relative overflow-hidden bg-[#0e131f]/90 rounded-3xl border border-slate-800/80 p-6 md:p-8 transition-all shadow-xl">
      {/* Background Subtle Accent Glow */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 ${
          isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-blue-500'
        }`}
      />

      {/* Top Banner & Price Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase font-mono">
              Algoritmo de Confluência Pro • ETH
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl md:text-4xl font-light tracking-tight text-slate-100 font-mono">
              ${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-medium font-mono rounded-lg border leading-none flex items-center gap-1 ${
                market.change24h >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {market.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {market.change24h >= 0 ? '+' : ''}
              {market.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24h High/Low and ATR Mini Display */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mínima 24h</p>
            <p className="text-slate-300 font-semibold mt-0.5">${market.low24h.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Máxima 24h</p>
            <p className="text-slate-300 font-semibold mt-0.5">${market.high24h.toLocaleString()}</p>
          </div>
          <div className="bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-500/30">
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Volatilidade ATR(14)</p>
            <p className="text-blue-200 font-bold mt-0.5">${market.atr14?.toFixed(2) || (market.price * 0.024).toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {/* Main Confluence Gauge Section */}
      <div className="py-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-slate-300 uppercase font-mono">
              Score Geral de Confluência
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={signal.totalScore}
                initial={{ opacity: 0.4, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-4xl md:text-5xl font-light text-slate-100 font-mono inline-block"
              >
                {signal.totalScore}
              </motion.span>
            </AnimatePresence>
            <span className="text-lg text-slate-500 font-normal font-mono">/100</span>
          </div>
        </div>

        {/* Animated Progress Bar using motion */}
        <div className="relative h-3.5 w-full bg-slate-900 rounded-full overflow-hidden mb-6 border border-slate-800/80 p-0.5">
          <motion.div
            initial={false}
            animate={{ width: `${signal.totalScore}%` }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 18,
              mass: 0.8
            }}
            className={`h-full rounded-full transition-colors duration-500 relative ${getScoreBarColor(
              signal.totalScore
            )}`}
          >
            {/* Subtle leading shine highlight on bar head */}
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full blur-[1px]"
            />
          </motion.div>
        </div>

        {/* Center Market State Callout / Recommended Signal Badge */}
        <div className="text-center">
          <div
            className={`inline-flex flex-col items-center px-6 py-3.5 rounded-2xl border transition-all ${
              isBuy
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : isSell
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-80 mb-1">
              Sinal Operacional Recomendado
            </p>
            <p className="text-xl md:text-2xl font-bold uppercase tracking-wide font-mono">
              {getScoreText(signal.totalScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Signal Action Bar: Valid Trade execution or Neutral status */}
      {!isNeutral ? (
        <div
          className={`mt-2 p-5 rounded-2xl border transition-all ${
            isBuy
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                  isBuy ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {isBuy ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-2">
                  <span>{isBuy ? '🟢 Sinal de Compra Recomendado' : '🔴 Sinal de Venda Recomendado'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900/80 border border-slate-700 text-slate-300 font-mono">
                    Confiança: {signal.confidence}%
                  </span>
                </p>
                <p className="text-xs opacity-90 mt-1 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Proporção R/R: <strong className="text-blue-400">{signal.riskRewardRatio}x</strong></span>
                  <span>•</span>
                  <span>Margem de Lucro Alvo: <strong className="text-emerald-400">+{signal.profitMarginPercent}%</strong></span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs font-mono w-full md:w-auto shrink-0">
              <div className="bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Preço Entrada</span>
                <span className="font-bold text-blue-400 text-sm">${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Alvo (Take Profit)</span>
                <span className="font-bold text-emerald-400 text-sm">${signal.targetPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Stop Loss</span>
                <span className="font-bold text-rose-400 text-sm">${signal.stopLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      ) : signal.isRiskRewardFilterVetoed ? (
        <div className="mt-2 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/30 text-amber-200 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                  ⚠️ Entrada Suspensa por Filtro de Risco
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5 max-w-xl font-mono leading-relaxed">
                  {signal.vetoReason || 'A margem de lucro calculada ou a relação risco/retorno é insuficiente para execução prudente (Exige R/R ≥ 1.5x e Margem ≥ 1.8%).'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs font-mono w-full md:w-auto shrink-0">
              <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Preço Atual</span>
                <span className="font-bold text-blue-400 text-sm">${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">R/R Obtido</span>
                <span className="font-bold text-amber-400 text-sm">{signal.riskRewardRatio ?? 0}x</span>
              </div>
              <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Margem</span>
                <span className="font-bold text-slate-300 text-sm">+{signal.profitMarginPercent ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                Modo Neutro (Aguardando Sinal Validador)
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Aguardando confluência ≥ 75% para COMPRA ou ≤ 25% para VENDA com R/R favorável.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs font-mono w-full md:w-auto">
            <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Preço Atual</span>
              <span className="font-bold text-blue-400 text-sm">${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Resistência</span>
              <span className="font-bold text-rose-400/90 text-sm">${market.technicalResistance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold tracking-wider">Suporte</span>
              <span className="font-bold text-emerald-400/90 text-sm">${market.technicalSupport.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rationale & Mathematical Proof Box */}
      <div className="mt-5 pt-4 border-t border-slate-800/60">
        <button
          onClick={() => setShowRationale(!showRationale)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-slate-200">
              Cálculo Racional da Decisão de Análise Geral
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{showRationale ? 'Ocultar Memória de Cálculo' : 'Exibir Memória de Cálculo'}</span>
            {showRationale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showRationale && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4 text-xs font-mono">
            {/* Step 1: Formula sum */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                1. Fórmula Ponderada dos 4 Pilares (ETFs 30%, Notícias 30%, Técnico 20%, On-Chain 20%)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">1. Técnico (20%)</span>
                  <span className="font-bold text-slate-200 text-sm">{techFactor}/100</span>
                  <span className="text-[10px] text-slate-500 block">{(techFactor * 0.20).toFixed(1)} pts</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">2. On-Chain (20%)</span>
                  <span className="font-bold text-slate-200 text-sm">{onchainFactor}/100</span>
                  <span className="text-[10px] text-slate-500 block">{(onchainFactor * 0.20).toFixed(1)} pts</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">3. Institucional (30%)</span>
                  <span className="font-bold text-slate-200 text-sm">{instFactor}/100</span>
                  <span className="text-[10px] text-slate-500 block">{(instFactor * 0.30).toFixed(1)} pts</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">4. Sentimento/Notícias (30%)</span>
                  <span className="font-bold text-slate-200 text-sm">{sentFactor}/100</span>
                  <span className="text-[10px] text-slate-500 block">{(sentFactor * 0.30).toFixed(1)} pts</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <strong>Score Confluência Calculado:</strong> (Inst × 0.30) + (Notícias × 0.30) + (Téc × 0.20) + (OnChain × 0.20) + Amplificador de Convicção = <strong className="text-blue-400">{signal.totalScore}/100</strong>
              </p>
            </div>

            {/* Step 2: Tools Breakdown */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                2. Evidências Coletadas pelas Ferramentas da Plataforma
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                {signal.rationale.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Decision & ATR Volatility Audit */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-2">
              <div>
                <strong className="text-amber-400 uppercase block mb-0.5">
                  ⚖️ Regra de Decisão do Algoritmo:
                </strong>
                • Se Score ≥ 75 ➔ Emite <strong>SINAL DE COMPRA (LONG)</strong> com gestão de risco.<br />
                • Se Score ≤ 25 ➔ Emite <strong>SINAL DE VENDA (SHORT)</strong> para proteção.<br />
                • Entre 26 e 74 ➔ Permanece em <strong>MODO NEUTRO</strong>, protegendo capital.
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-blue-300 font-mono">
                <strong className="text-blue-400 uppercase block mb-0.5">
                  📐 Auditoria de Níveis de Saída (Modelo ATR Volatility):
                </strong>
                Níveis de Alvo e Stop Loss calculados com base na volatilidade ATR(14) atual de <strong className="text-white">${market.atr14?.toFixed(2) || (market.price * 0.024).toFixed(2)} USD</strong>:<br />
                • <strong>Stop Loss:</strong> 1.5x ATR de distância do preço de entrada (proteção estatística contra ruído).<br />
                • <strong>Alvo (Take Profit):</strong> 2.6x ATR de distância (alvo estatisticamente realizável no ciclo atual).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action to view score breakdown */}
      <div className="mt-5 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Matriz de Confluência Quanti-Sistemática</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenDebug && (
            <button
              onClick={onOpenDebug}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console Debug</span>
            </button>
          )}
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-mono text-xs transition-all"
          >
            <span>Ver Decomposição dos Pilares</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

