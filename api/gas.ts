import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'ETHERSCAN_API_KEY not configured' });
    return;
  }

  try {
    const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`;
    const ethRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await ethRes.json();

    if (data.status === '1' && data.result) {
      res.status(200).json({
        low: parseFloat(data.result.SafeGasPrice) || 0,
        average: parseFloat(data.result.ProposeGasPrice) || 0,
        fast: parseFloat(data.result.FastGasPrice) || 0,
        lastBlock: parseInt(data.result.LastBlock) || 0,
      });
    } else {
      res.status(502).json({ error: 'Etherscan API error' });
    }
  } catch {
    res.status(500).json({ error: 'Failed to fetch gas data' });
  }
}
