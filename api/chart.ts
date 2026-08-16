import type { VercelRequest, VercelResponse } from '@vercel/node';

function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const interval = (req.query.interval as string) || '1h';
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`;
    const binanceRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await binanceRes.json();

    if (!Array.isArray(data)) {
      res.status(502).json({ error: 'Binance API error' });
      return;
    }

    const candles = data.map((k: any[]) => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    const closes = candles.map((c: any) => c.close);
    const rsi14 = calculateRSI(closes);

    res.status(200).json({ candles, rsi14 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
}
