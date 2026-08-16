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

export default function App() {
  const [scenario, setScenario] = useState<ScenarioPreset>('live');
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  // Fetch market summary from backend Express API with client-side fallback
  const fetchMarketSummary = useCallback(async (preset: ScenarioPreset, isSilent = false) => {
    if (!isSilent) {
      setIsRefreshing(true);
    }
    
    try {
      const res = await fetch(`/api/market-summary?preset=${preset}`);
      if (res.ok) {
        const data = await res.json();
        setMarketSummary(data);
      } else {
        throw new Error(`HTTP error ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend fetch unavail, using client engine fallback:', err);
      try {
        const scenarioData = getScenarioData(preset);
        const signal = calculateConfluence(
          scenarioData.market,
          scenarioData.defi,
          scenarioData.institutional,
          scenarioData.sentiment,
          scenarioData.whales,
          scenarioData.news
        );
        setMarketSummary({ ...scenarioData, signal });
      } catch (fallbackErr) {
        console.error('Fallback generation error:', fallbackErr);
      }
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
