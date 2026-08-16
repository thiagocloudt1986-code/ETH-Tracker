import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CoreSignalCard } from './components/CoreSignalCard';
import { ConfluenceDetailModal } from './components/ConfluenceDetailModal';
import { DebugConsoleModal } from './components/DebugConsoleModal';
import { MarketChart } from './components/MarketChart';
import { OnChainWhalesModule } from './components/OnChainWhalesModule';
import { InstitutionalEtfModule } from './components/InstitutionalEtfModule';
import { InstitutionalStrategyTracker } from './components/InstitutionalStrategyTracker';
import { SentimentSocialModule } from './components/SentimentSocialModule';
import { NewsEventsModule } from './components/NewsEventsModule';
import { BacktestSimulator } from './components/BacktestSimulator';
import { AiInstitutionalAdvisor } from './components/AiInstitutionalAdvisor';
import { AlertsDrawer } from './components/AlertsDrawer';
import { ScenarioPreset } from './types';
import { getScenarioData } from './services/marketData';
import { calculateConfluence } from './services/confluenceEngine';
import { fetchLiveData } from './services/liveApi';

export default function App() {
  const [scenario, setScenario] = useState<ScenarioPreset>('live');
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const fetchMarketSummary = useCallback(async (preset: ScenarioPreset, isSilent = false) => {
    if (!isSilent) {
      setIsRefreshing(true);
    }

    try {
      const scenarioData = getScenarioData(preset);

      if (preset === 'live') {
        const live = await fetchLiveData();
        if (live) {
          scenarioData.market.price = live.price;
          scenarioData.market.change24h = live.change24h;
          scenarioData.market.volume24hUsd = live.volume24hUsd;
          scenarioData.market.technicalSupport = Math.round(live.price * 0.962);
          scenarioData.market.technicalResistance = Math.round(live.price * 1.038);
          scenarioData.market.high24h = Math.round(live.price * 1.025);
          scenarioData.market.low24h = Math.round(live.price * 0.972);
          scenarioData.market.atr14 = Number((live.price * 0.024).toFixed(2));
          if (live.gasPrice > 0) scenarioData.market.gasPriceGwei = live.gasPrice;
          if (live.rsi14 > 0) scenarioData.market.rsi14 = live.rsi14;
          if (live.fundingRate !== 0) scenarioData.market.fundingRate = live.fundingRate;

          scenarioData.defi.tvlUsd = live.tvlUsd;
          scenarioData.defi.tvlChange24h = live.tvlChange24h;
          scenarioData.defi.topProtocols = live.topProtocols;
          scenarioData.defi.stablecoinTotalUsd = live.stablecoinTotalUsd;

          if (live.etfFlows) {
            scenarioData.institutional.etfNetFlowTodayUsd = live.etfFlows.netFlowUsd;
          }

          if (live.news.length > 0) {
            scenarioData.news = live.news.map(n => ({
              ...n,
              impact: n.impact as 'high' | 'medium' | 'low',
              sentiment: n.sentiment as 'positive' | 'negative' | 'neutral',
              category: n.category as 'SEC/Regulação' | 'ETF' | 'Upgrade/Network' | 'Macro' | 'DeFi/Hack' | 'Geral',
            }));
          }

          scenarioData.sentiment.fearAndGreedIndex = live.fgIndex;
          scenarioData.sentiment.fearAndGreedLabel = live.fgLabel;
        }
      }

      const signal = calculateConfluence(
        scenarioData.market,
        scenarioData.defi,
        scenarioData.institutional,
        scenarioData.sentiment,
        scenarioData.whales,
        scenarioData.news
      );
      setMarketSummary({ ...scenarioData, signal });
    } catch (err) {
      console.error('Market summary generation error:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketSummary(scenario);
  }, [scenario, fetchMarketSummary]);

  // Auto-refresh timer every 10 seconds for real-time live sync (silent update to prevent UI flickering)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketSummary(scenario, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [scenario, fetchMarketSummary]);

  if (isLoadingInitial && !marketSummary) {
    return (
      <div className="min-h-screen bg-[#0c1017] flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando dados institucionais do ETH Tracker Pro...</p>
        </div>
      </div>
    );
  }

  const { market, defi, institutional, sentiment, whales, news, events, backtest, signal } = marketSummary;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] font-sans antialiased selection:bg-blue-500 selection:text-white pb-12">
      {/* Top Sticky Header */}
      <Header
        scenario={scenario}
        onScenarioChange={setScenario}
        onRefresh={() => fetchMarketSummary(scenario)}
        isRefreshing={isRefreshing}
        lastUpdated={market.lastUpdated}
        hasUnreadAlerts={hasUnreadAlerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenDebug={() => setIsDebugOpen(true)}
      />

      {/* Main Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Core PRD Signal Card */}
        <CoreSignalCard
          market={market}
          signal={signal}
          onOpenDetails={() => setIsDetailsOpen(true)}
          onOpenDebug={() => setIsDebugOpen(true)}
        />

        {/* Grid Layout: Main Charts & On-Chain Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Price Chart + Institutional Strategy Tracker + Institutional ETFs + AI Assistant */}
          <div className="lg:col-span-2 space-y-6">
            <MarketChart market={market} />
            <InstitutionalStrategyTracker tracker={institutional?.tracker} currentPrice={market?.price} />
            <InstitutionalEtfModule institutional={institutional} />
            <AiInstitutionalAdvisor currentSetup={marketSummary} />
            <BacktestSimulator records={backtest} />
          </div>

          {/* Right Column (1 col): On-Chain Whales + Sentiment + News */}
          <div className="space-y-6">
            <OnChainWhalesModule market={market} defi={defi} whales={whales} />
            <SentimentSocialModule sentiment={sentiment} />
            <NewsEventsModule news={news} events={events} />
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <ConfluenceDetailModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        signal={signal}
      />

      <DebugConsoleModal
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        signal={signal}
        market={market}
        scenario={scenario}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onClearUnread={() => setHasUnreadAlerts(false)}
        marketSummary={marketSummary}
      />
    </div>
  );
}
