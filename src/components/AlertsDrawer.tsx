import React from 'react';
import { X, Bell, RefreshCw, Zap, TrendingUp, TrendingDown, ShieldAlert, Layers } from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClearUnread: () => void;
  marketSummary?: any;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  onClearUnread,
  marketSummary
}) => {
  if (!isOpen) return null;

  const market = marketSummary?.market;
  const signal = marketSummary?.signal;
  const whales = marketSummary?.whales;
  const institutional = marketSummary?.institutional;
  const sentiment = marketSummary?.sentiment;
  const news = marketSummary?.news;

  // Build dynamic real-time alerts based on actual marketSummary state
  const dynamicAlerts = [];

  if (institutional?.tracker) {
    const tracker = institutional.tracker;
    const isCritical = tracker.dumpThreatLevel === 'RISCO CRÍTICO DE DUMP';
    dynamicAlerts.unshift({
      id: 'tracker_dump_alert',
      title: isCritical
        ? `🚨 RASTREADOR DE DUMP: Risco Crítico de Queda (${tracker.dumpProbabilityPercent}%)`
        : `🤖 RASTREADOR ESTRATÉGICO: Threat Level ${tracker.dumpThreatLevel}`,
      time: 'Tempo Real',
      type: 'whale',
      read: false,
      desc: tracker.recommendation
    });
  }

  if (signal && market) {
    const isBuy = signal.status === 'BUY';
    const isSell = signal.status === 'SELL';
    
    dynamicAlerts.push({
      id: 'signal_alert',
      title: isBuy
        ? `🟢 Sinal de Compra Emitido (Score ${signal.totalScore}/100)`
        : isSell
        ? `🔴 Sinal de Venda Emitido (Score ${signal.totalScore}/100)`
        : signal.isRiskRewardFilterVetoed
        ? `⚠️ Veto de Risco: R/R Insuficiente (${signal.riskRewardRatio ?? 0}x)`
        : `🔵 Confluência em Modo Neutro (${signal.totalScore}/100)`,
      time: `Atualizado às ${market.lastUpdated}`,
      type: 'signal',
      read: false,
      desc: isBuy
        ? `ETH em $${market.price.toLocaleString('en-US')}. Entrada em Long com Alvo de $${signal.targetPrice?.toLocaleString('en-US')} (+${signal.profitMarginPercent}%) e Stop Loss em $${signal.stopLoss?.toLocaleString('en-US')}.`
        : isSell
        ? `ETH em $${market.price.toLocaleString('en-US')}. Entrada em Short com Alvo de $${signal.targetPrice?.toLocaleString('en-US')} e Stop Loss em $${signal.stopLoss?.toLocaleString('en-US')}.`
        : signal.isRiskRewardFilterVetoed
        ? `${signal.vetoReason || 'A relação risco/retorno calculada é menor que o piso exigido de 1.5x. Nenhuma ordem executada.'}`
        : `O algoritmo aguarda convergência de pelo menos 75% dos 4 pilares para liberar entrada segura.`
    });
  }

  if (whales && whales.length > 0) {
    const topWhale = whales[0];
    const isDump = topWhale.direction === 'wallet_to_exchange';
    dynamicAlerts.push({
      id: 'whale_alert',
      title: isDump
        ? `🚨 Whale Deposit: ${topWhale.amountEth.toLocaleString()} ETH para ${topWhale.toLabel}`
        : `🐋 Whale Accumulation: ${topWhale.amountEth.toLocaleString()} ETH para Custódia Fria`,
      time: topWhale.timestamp || 'Há 8 minutos',
      type: 'whale',
      read: false,
      desc: isDump
        ? `Baleia transferiu $${(topWhale.amountUsd / 1_000_000).toFixed(1)}M USD de ${topWhale.fromLabel} para ${topWhale.toLabel}. Alerta de possível pressão vendedora.`
        : `Retirada massiva de $${(topWhale.amountUsd / 1_000_000).toFixed(1)}M USD de corretora para carteira privada. Sinal de acumulação institucional.`
    });
  }

  if (institutional) {
    const etfVal = (institutional.etfNetFlowTodayUsd || 0) / 1_000_000;
    const isPositive = etfVal >= 0;
    dynamicAlerts.push({
      id: 'etf_alert',
      title: isPositive
        ? `🏛️ Inflow Líquido em ETFs ETH: +$${etfVal.toFixed(1)}M hoje`
        : `🏛️ Saída Líquida em ETFs ETH: -$${Math.abs(etfVal).toFixed(1)}M hoje`,
      time: 'Sessão Atual',
      type: 'macro',
      read: false,
      desc: isPositive
        ? `Aporte institucional acelerado nos ETFs de Ethereum (liderados por BlackRock e Fidelity), sustentando o fluxo comprador.`
        : `Volume de resgates institucionais superou novos aportes nos fundos de ETF ETH Spot.`
    });
  }

  if (sentiment && market) {
    const fg = sentiment.fearAndGreedIndex;
    dynamicAlerts.push({
      id: 'sentiment_alert',
      title: fg <= 35
        ? `😱 Sentimento: Medo no Mercado (${fg}/100)`
        : fg >= 70
        ? `🔥 Sentimento: Ganância Extrema (${fg}/100)`
        : `📊 Indicadores: RSI(14) em ${market.rsi14.toFixed(1)} | Funding ${(market.fundingRate * 100).toFixed(3)}%`,
      time: 'Há 15 minutos',
      type: 'indicator',
      read: true,
      desc: fg <= 35
        ? `Pessimismo exacerbado no mercado aciona gatilho contrariador de compra gradual.`
        : fg >= 70
        ? `Eufórica no sentimento social alerta para risco de liquidação de longs alavancados.`
        : `Preço negociado a $${market.price.toLocaleString()} entre suporte ($${market.technicalSupport.toLocaleString()}) e resistência ($${market.technicalResistance.toLocaleString()}).`
    });
  }

  if (news && news.length > 0) {
    const topNews = news[0];
    dynamicAlerts.push({
      id: 'news_alert',
      title: `📰 ${topNews.title}`,
      time: topNews.publishedAt || 'Recente',
      type: 'news',
      read: true,
      desc: `${topNews.summary} (Fonte: ${topNews.source})`
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0c1017] border-l border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-100 font-mono">
                  Alertas em Tempo Real
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Zero Ruído • Atualização Dinâmica
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Sync Status indicator */}
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Sincronizado com os Ticks de Mercado
            </span>
            <span className="text-slate-400 text-[10px]">10s Auto-Sync</span>
          </div>
        </div>

        {/* Alerts List */}
        <div className="my-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
          {dynamicAlerts.length > 0 ? (
            dynamicAlerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-200 leading-snug">{alt.title}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{alt.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-0.5">
                  {alt.desc}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Sincronizando alertas...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              onClearUnread();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors w-full text-center font-bold"
          >
            Marcar Alertas como Vistos
          </button>
        </div>
      </div>
    </div>
  );
};

