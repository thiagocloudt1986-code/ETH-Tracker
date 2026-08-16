export type SignalType = 'NEUTRAL' | 'BUY' | 'SELL';

export interface EthMarketData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  gasPriceGwei: number;
  rsi14: number;
  fundingRate: number;
  technicalSupport: number;
  technicalResistance: number;
  atr14: number; // Volatilidade média de 14 períodos em USD
  lastUpdated: string;
}

export interface ConfluenceFactor {
  id: string;
  category: 'technical' | 'onchain' | 'institutional' | 'sentiment';
  label: string;
  score: number; // 0 - 100
  weight: number; // percentage, e.g., 25
  status: 'bullish' | 'bearish' | 'neutral';
  value: string;
  conditionMet: boolean;
  explanation: string;
}

export interface ConfluenceSignal {
  status: SignalType;
  confidence: number; // 0 - 100
  totalScore: number; // 0 - 100
  targetPrice: number | null;
  stopLoss: number | null;
  riskRewardRatio: number | null;
  profitMarginPercent?: number | null;
  entryPrice: number | null;
  rationale: string[];
  factors: ConfluenceFactor[];
  timestamp: string;
  isRiskRewardFilterVetoed?: boolean;
  vetoReason?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  category: 'SEC/Regulação' | 'ETF' | 'Upgrade/Network' | 'Macro' | 'DeFi/Hack' | 'Geral';
  summary: string;
}

export interface WhaleAlert {
  id: string;
  timestamp: string;
  amountEth: number;
  amountUsd: number;
  fromLabel: string;
  toLabel: string;
  direction: 'exchange_to_wallet' | 'wallet_to_exchange' | 'exchange_to_exchange' | 'wallet_to_wallet';
  txHash: string;
  isHot: boolean;
}

export interface DeFiStats {
  tvlEth: number;
  tvlUsd: number;
  tvlChange24h: number;
  topProtocols: {
    name: string;
    tvlUsd: number;
    category: string;
    sharePercent: number;
  }[];
  stablecoinTotalUsd: number;
  stablecoinFlow24hUsd: number;
}

export interface EtfFundInfo {
  fundName: string;
  ticker: string;
  provider: string;
  holdingsEth: number;
  flow24hUsd: number;
  flow7dUsd: number;
}

export interface InstitutionalPattern {
  id: string;
  name: string;
  type: 'bearish_dump' | 'bullish_accumulation' | 'neutral_rotation';
  threatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  volumeInvolvedEth: number;
  volumeInvolvedUsd: number;
  detectedAt: string;
  description: string;
  probabilityOfDumpPercent: number;
  keyIndicators: string[];
}

export interface InstitutionalTrackerStats {
  dumpThreatLevel: 'RISCO CRÍTICO DE DUMP' | 'ALERTA ELEVADO' | 'MODERADO' | 'ESTÁVEL / ACUMULAÇÃO';
  dumpProbabilityPercent: number; // 0 - 100%
  stealthSellingVolume24hEth: number;
  icebergSellWallEth: number;
  openInterestDivergenceScore: number; // % change in short open interest
  exchangeInflowSpikeRatio: number; // e.g. 3.4x above 30d average
  activePatterns: InstitutionalPattern[];
  recommendation: string;
}

export interface InstitutionalStats {
  etfNetFlowTodayUsd: number;
  etfNetFlow7dUsd: number;
  etfFunds: EtfFundInfo[];
  soprMetric: number; // Spent Output Profit Ratio (>1 profit taking, <1 panic selling)
  exchangeReserveChangeEth24h: number;
  nasdaqCorrelation: number;
  tracker?: InstitutionalTrackerStats;
}

export interface SentimentStats {
  fearAndGreedIndex: number;
  fearAndGreedLabel: 'Medo Extremo' | 'Medo' | 'Neutro' | 'Ganância' | 'Ganância Extrema';
  fearAndGreedChange24h: number;
  galaxyScore: number; // LunarCrush Galaxy Score
  socialDominance: number; // %
  altRank: number;
  socialBuzzVolume24h: number;
}

export interface EventItem {
  id: string;
  date: string;
  title: string;
  category: 'Upgrade' | 'FOMC' | 'Unlocks' | 'Opções';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface BacktestSignalRecord {
  id: string;
  date: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  exitPrice: number;
  returnPercent: number;
  isWin: boolean;
  confluenceScore: number;
  holdingHours: number;
  keyDrivers: string[];
}

export type ScenarioPreset = 'live' | 'bullish_surge' | 'bearish_dump' | 'neutral_wait' | 'whale_panic';
