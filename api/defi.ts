import type { VercelRequest, VercelResponse } from '@vercel/node';

const CHAIN_SLUG = 'Ethereum';

async function fetchJSON(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    const [chainsRes, protocolsRes, stablecoinsRes] = await Promise.allSettled([
      fetchJSON('https://api.llama.fi/v2/chains'),
      fetchJSON('https://api.llama.fi/protocols'),
      fetchJSON('https://stablecoins.llama.fi/stablecoins?includePrices=true'),
    ]);

    const chains = chainsRes.status === 'fulfilled' ? chainsRes.value : [];
    const ethChain = Array.isArray(chains)
      ? chains.find((c: any) => c.name === CHAIN_SLUG)
      : null;

    const protocols = protocolsRes.status === 'fulfilled' ? protocolsRes.value : [];
    const ethProtocols = Array.isArray(protocols)
      ? protocols
          .filter((p: any) => p.chains?.includes(CHAIN_SLUG))
          .sort((a: any, b: any) => (b.currentChainTvls?.[CHAIN_SLUG] || 0) - (a.currentChainTvls?.[CHAIN_SLUG] || 0))
          .slice(0, 10)
          .map((p: any) => ({
            name: p.name,
            tvlUsd: p.currentChainTvls?.[CHAIN_SLUG] || p.tvl || 0,
            category: p.category || 'Other',
          }))
      : [];

    const totalEthTvl = ethProtocols.reduce((sum: number, p: any) => sum + p.tvlUsd, 0);

    const stablecoins = stablecoinsRes.status === 'fulfilled' ? stablecoinsRes.value : {};
    const stablecoinData = stablecoins?.peggedAssets || [];
    let stablecoinTotalUsd = 0;
    for (const asset of stablecoinData) {
      const ethChainData = asset.chainCirculating?.[CHAIN_SLUG];
      if (ethChainData) {
        stablecoinTotalUsd += ethChainData.current?.peggedUSD || 0;
      }
    }

    res.status(200).json({
      tvlUsd: ethChain?.tvl || totalEthTvl,
      tvlChange24h: ethChain?.change_1d || 0,
      topProtocols: ethProtocols.map((p: any) => ({
        name: p.name,
        tvlUsd: p.tvlUsd,
        category: p.category,
        sharePercent: totalEthTvl > 0 ? (p.tvlUsd / totalEthTvl) * 100 : 0,
      })),
      stablecoinTotalUsd,
      stablecoinFlow24hUsd: 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch DeFi data' });
  }
}
