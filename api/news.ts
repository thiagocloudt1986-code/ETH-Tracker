import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RawItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
}

function parseRSSItems(xml: string, source: string): RawItem[] {
  const items: RawItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title =
      block
        .match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .trim() || '';
    const link =
      block
        .match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .trim() || '';
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
    const description =
      block
        .match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .trim() || '';
    if (title && link) {
      items.push({ title, link, pubDate, source, description });
    }
  }
  return items;
}

function categorize(title: string, desc: string): { impact: string; sentiment: string; category: string } {
  const text = `${title} ${desc}`.toLowerCase();
  const impact =
    /hack|exploit|crash|sec|regulat|ban|etf|upgrade|merge/.test(text)
      ? 'high'
      : /launch|partnership|adoption|staking/.test(text)
        ? 'medium'
        : 'low';
  const sentiment =
    /surge|rally|bull|adopt|approve|launch|record/.test(text)
      ? 'positive'
      : /hack|exploit|crash|ban|reject|lawsuit/.test(text)
        ? 'negative'
        : 'neutral';
  const category =
    /sec|regulat|ban|law|compliance/.test(text)
      ? 'SEC/Regulação'
      : /etf/.test(text)
        ? 'ETF'
        : /upgrade|merge|network|layer/.test(text)
          ? 'Upgrade/Network'
          : /defi|hack|exploit/.test(text)
            ? 'DeFi/Hack'
            : 'Geral';
  return { impact, sentiment, category };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  const feeds = [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss', source: 'CoinDesk' },
    { url: 'https://www.theblock.co/rss.xml', source: 'TheBlock' },
  ];

  const allItems: RawItem[] = [];

  for (const feed of feeds) {
    try {
      const feedRes = await fetch(feed.url, { signal: AbortSignal.timeout(8000) });
      if (feedRes.ok) {
        const xml = await feedRes.text();
        allItems.push(...parseRSSItems(xml, feed.source));
      }
    } catch {
      /* skip failed feed */
    }
  }

  const sorted = allItems
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10);

  const news = sorted.map((item, i) => {
    const { impact, sentiment, category } = categorize(item.title, item.description || '');
    return {
      id: `news-${i}`,
      title: item.title,
      source: item.source,
      url: item.link,
      publishedAt: item.pubDate,
      impact,
      sentiment,
      category,
      summary: item.description || item.title,
    };
  });

  res.status(200).json(news);
}
