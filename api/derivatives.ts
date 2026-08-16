import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE = 'https://open-api-v4.coinglass.com';

async function cgFetch(path: string, apiKey: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'CG-API-KEY': apiKey, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const apiKey = process.env.COINGLASS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'COINGLASS_API_KEY not configured' });
    return;
  }

  try {
    const [fundingRes, oiRes, etfRes] = await Promise.allSettled([
      cgFetch('/api/futures/fundingRate/exchange-list?symbol=ETH', apiKey),
      cgFetch('/api/futures/openInterest/exchange-list?symbol=ETH', apiKey),
      cgFetch('/api/ethereum/etf/flow-history?interval=1w&limit=4', apiKey),
    ]);

    const fundingData = fundingRes.status === 'fulfilled' ? fundingRes.value?.data : null;
    const avgFunding =
      Array.isArray(fundingData) && fundingData.length > 0
        ? fundingData.reduce((s: number, f: any) => s + (parseFloat(f.fundingRate) || 0), 0) /
          fundingData.length
        : 0;

    const oiData = oiRes.status === 'fulfilled' ? oiRes.value?.data : null;
    const totalOI =
      Array.isArray(oiData) && oiData.length > 0
        ? oiData.reduce((s: number, o: any) => s + (o.openInterest || 0), 0)
        : 0;

    const etfData = etfRes.status === 'fulfilled' ? etfRes.value?.data : null;
    const latestETF =
      Array.isArray(etfData) && etfData.length > 0 ? etfData[etfData.length - 1] : null;

    res.status(200).json({
      fundingRate: avgFunding,
      openInterestUsd: totalOI,
      etfFlows: latestETF
        ? {
            netFlowUsd: latestETF.totalFlowUsd || 0,
            date: latestETF.date || '',
          }
        : null,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch derivatives data' });
  }
}
