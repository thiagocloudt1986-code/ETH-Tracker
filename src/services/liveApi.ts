export interface LiveData {
  price: number;
  change24h: number;
  volume24hUsd: number;
  fgIndex: number;
  fgLabel: 'Medo Extremo' | 'Medo' | 'Neutro' | 'Ganância' | 'Ganância Extrema';
}

let cache: { data: LiveData; timestamp: number } | null = null;
const CACHE_TTL_MS = 8000;

function getFgLabel(val: number): LiveData['fgLabel'] {
  if (val < 25) return 'Medo Extremo';
  if (val < 45) return 'Medo';
  if (val <= 55) return 'Neutro';
  if (val <= 75) return 'Ganância';
  return 'Ganância Extrema';
}

export async function fetchLiveData(): Promise<LiveData | null> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const [cgRes, fgRes] = await Promise.allSettled([
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
        { signal: AbortSignal.timeout(5000) }
      ),
      fetch('https://api.alternative.me/fng/?limit=1', {
        signal: AbortSignal.timeout(4000),
      }),
    ]);

    let price = 0;
    let change24h = 0;
    let volume24hUsd = 0;
    let fgIndex = 50;

    if (cgRes.status === 'fulfilled' && cgRes.value.ok) {
      const cgData = await cgRes.value.json();
      if (cgData.ethereum) {
        price = cgData.ethereum.usd;
        change24h = cgData.ethereum.usd_24h_change;
        volume24hUsd = cgData.ethereum.usd_24h_vol;
      }
    }

    if (fgRes.status === 'fulfilled' && fgRes.value.ok) {
      const fgData = await fgRes.value.json();
      if (fgData.data?.length > 0) {
        fgIndex = parseInt(fgData.data[0].value, 10);
      }
    }

    if (!price) return null;

    const data: LiveData = {
      price,
      change24h: Number(change24h.toFixed(2)),
      volume24hUsd,
      fgIndex,
      fgLabel: getFgLabel(fgIndex),
    };

    cache = { data, timestamp: Date.now() };
    return data;
  } catch {
    return null;
  }
}
