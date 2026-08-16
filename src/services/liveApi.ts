import { fetchWithCache, getApiBase } from './apiClient';

export interface LiveData {
  price: number;
  change24h: number;
  volume24hUsd: number;
  fgIndex: number;
  fgLabel: 'Medo Extremo' | 'Medo' | 'Neutro' | 'Ganância' | 'Ganância Extrema';
  gasPrice: number;
  rsi14: number;
  fundingRate: number;
  tvlUsd: number;
  tvlChange24h: number;
  topProtocols: { name: string; tvlUsd: number; category: string; sharePercent: number }[];
  stablecoinTotalUsd: number;
  etfFlows: { netFlowUsd: number; date: string } | null;
  openInterestUsd: number;
  candles: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[];
  news: { id: string; title: string; source: string; url: string; publishedAt: string; impact: string; sentiment: string; category: string; summary: string }[];
}

function getFgLabel(val: number): LiveData['fgLabel'] {
  if (val < 25) return 'Medo Extremo';
  if (val < 45) return 'Medo';
  if (val <= 55) return 'Neutro';
  if (val <= 75) return 'Ganância';
  return 'Ganância Extrema';
}

export async function fetchLiveData(): Promise<LiveData | null> {
  const base = getApiBase();

  const [coingecko, fng, gas, chart, derivatives, defi, news] = await Promise.allSettled([
    fetchWithCache<any>(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
      10000
    ),
    fetchWithCache<any>('https://api.alternative.me/fng/?limit=1', 60000),
    fetchWithCache<any>(`${base}/api/gas`, 30000),
    fetchWithCache<any>(`${base}/api/chart?interval=1h&limit=100`, 60000),
    fetchWithCache<any>(`${base}/api/derivatives`, 60000),
    fetchWithCache<any>(`${base}/api/defi`, 300000),
    fetchWithCache<any>(`${base}/api/news`, 300000),
  ]);

  const eth = coingecko.status === 'fulfilled' ? coingecko.value?.ethereum : null;
  if (!eth) return null;

  const fngData = fng.status === 'fulfilled' ? fng.value?.data?.[0] : null;
  const gasData = gas.status === 'fulfilled' ? gas.value : null;
  const chartData = chart.status === 'fulfilled' ? chart.value : null;
  const derivData = derivatives.status === 'fulfilled' ? derivatives.value : null;
  const defiData = defi.status === 'fulfilled' ? defi.value : null;
  const newsData = news.status === 'fulfilled' ? news.value : null;

  return {
    price: eth.usd || 0,
    change24h: Number((eth.usd_24h_change || 0).toFixed(2)),
    volume24hUsd: eth.usd_24h_vol || 0,
    fgIndex: fngData ? parseInt(fngData.value) : 50,
    fgLabel: fngData ? getFgLabel(parseInt(fngData.value)) : 'Neutro',
    gasPrice: gasData?.average ?? 0,
    rsi14: chartData?.rsi14 ?? 50,
    fundingRate: derivData?.fundingRate ?? 0,
    tvlUsd: defiData?.tvlUsd ?? 0,
    tvlChange24h: defiData?.tvlChange24h ?? 0,
    topProtocols: defiData?.topProtocols ?? [],
    stablecoinTotalUsd: defiData?.stablecoinTotalUsd ?? 0,
    etfFlows: derivData?.etfFlows ?? null,
    openInterestUsd: derivData?.openInterestUsd ?? 0,
    candles: chartData?.candles ?? [],
    news: newsData ?? [],
  };
}
