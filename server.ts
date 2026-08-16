import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getScenarioData } from './src/services/marketData.js';
import { calculateConfluence } from './src/services/confluenceEngine.js';
import { ScenarioPreset } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory cache for external API raw values
  let externalCache: {
    price?: number;
    change24h?: number;
    volume24hUsd?: number;
    fgIndex?: number;
    fgLabel?: 'Medo Extremo' | 'Medo' | 'Neutro' | 'Ganância' | 'Ganância Extrema';
    timestamp: number;
  } | null = null;

  // Initialize Gemini AI client lazily when endpoint is hit
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  // --- API ENDPOINTS ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Main Market Data API (combines live/preset data + confluence score)
  app.get('/api/market-summary', async (req, res) => {
    try {
      const scenario = (req.query.preset as ScenarioPreset) || 'live';
      const scenarioData = getScenarioData(scenario);

      // Attempt live fetch if scenario is 'live' and external cache expired (> 15 sec)
      if (scenario === 'live') {
        if (!externalCache || Date.now() - externalCache.timestamp > 15000) {
          const newCache: typeof externalCache = { timestamp: Date.now() };

          try {
            // Fetch live ETH price from CoinGecko public API with timeout
            const cgRes = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
              { headers: { 'User-Agent': 'ETHTrackerPro/1.0' }, signal: AbortSignal.timeout(3500) }
            );
            if (cgRes.ok) {
              const cgData = await cgRes.json();
              if (cgData.ethereum) {
                newCache.price = cgData.ethereum.usd;
                newCache.change24h = cgData.ethereum.usd_24h_change;
                newCache.volume24hUsd = cgData.ethereum.usd_24h_vol;
              }
            }
          } catch (err) {
            console.warn('CoinGecko fallback active:', (err as Error).message);
          }

          try {
            // Fetch Fear & Greed Index from Alternative.me
            const fgRes = await fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(3000) });
            if (fgRes.ok) {
              const fgData = await fgRes.json();
              if (fgData.data && fgData.data.length > 0) {
                const val = parseInt(fgData.data[0].value, 10);
                newCache.fgIndex = val;
                if (val < 25) newCache.fgLabel = 'Medo Extremo';
                else if (val < 45) newCache.fgLabel = 'Medo';
                else if (val <= 55) newCache.fgLabel = 'Neutro';
                else if (val <= 75) newCache.fgLabel = 'Ganância';
                else newCache.fgLabel = 'Ganância Extrema';
              }
            }
          } catch (err) {
            console.warn('FearGreed fallback active:', (err as Error).message);
          }

          if (newCache.price || newCache.fgIndex) {
            externalCache = { ...externalCache, ...newCache, timestamp: Date.now() };
          }
        }

        // Apply external cache if available
        if (externalCache) {
          if (externalCache.price) {
            scenarioData.market.price = externalCache.price;
            scenarioData.market.technicalSupport = Math.round(externalCache.price * 0.962);
            scenarioData.market.technicalResistance = Math.round(externalCache.price * 1.038);
            scenarioData.market.high24h = Math.round(externalCache.price * 1.025);
            scenarioData.market.low24h = Math.round(externalCache.price * 0.972);
            scenarioData.market.atr14 = Number((externalCache.price * 0.024).toFixed(2));
          }
          if (externalCache.change24h !== undefined) {
            scenarioData.market.change24h = externalCache.change24h;
          }
          if (externalCache.volume24hUsd !== undefined) {
            scenarioData.market.volume24hUsd = externalCache.volume24hUsd;
          }
          if (externalCache.fgIndex !== undefined && externalCache.fgLabel) {
            scenarioData.sentiment.fearAndGreedIndex = externalCache.fgIndex;
            scenarioData.sentiment.fearAndGreedLabel = externalCache.fgLabel;
          }
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

      res.json({
        ...scenarioData,
        signal
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate market summary', message: error.message });
    }
  });

  // AI Institutional Advisor Endpoint
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const { question, currentSetup } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          advisorText: `[Modo Análise Institucional Sem API Key]
Para obter análises em tempo real alimentadas pelo Gemini 2.5, configure a chave GEMINI_API_KEY no painel Secrets do AI Studio.

Resumo Racional da Confluência Atual:
• Status: ${currentSetup?.signal?.status || 'NEUTRAL'} (Score: ${currentSetup?.signal?.totalScore || 50}/100)
• Preço ETH: $${currentSetup?.market?.price || '3,247'} (${currentSetup?.market?.change24h > 0 ? '+' : ''}${currentSetup?.market?.change24h || 0}%)
• Visão da Confluência: O modelo manteve o estado neutro priorizando alta taxa de acerto. Aguarde confirmação técnica no suporte com fluxo positivo em ETFs.`
        });
      }

      const prompt = `
Você é o estrategista chefe institucional do ETH Tracker Pro, uma ferramenta para traders de curto prazo baseada na lógica de grandes bancos e gestores (BlackRock, JPMorgan, Glassnode).

DADOS ATUAIS DE MERCADO DO ETHEREUM:
- Preço Atual: $${currentSetup?.market?.price} USD
- Variação 24h: ${currentSetup?.market?.change24h}%
- RSI (14): ${currentSetup?.market?.rsi14}
- Gas Price: ${currentSetup?.market?.gasPriceGwei} Gwei
- Confluência Atual: ${currentSetup?.signal?.totalScore}/100 (${currentSetup?.signal?.status})
- Fluxo de ETF 24h: $${(currentSetup?.institutional?.etfNetFlowTodayUsd / 1e6).toFixed(1)}M
- Fluxo de Stablecoins 24h: $${(currentSetup?.defi?.stablecoinFlow24hUsd / 1e6).toFixed(1)}M
- Fear & Greed: ${currentSetup?.sentiment?.fearAndGreedIndex} (${currentSetup?.sentiment?.fearAndGreedLabel})

PERGUNTA / PEDIDO DO TRADER:
"${question || 'Faça um resumo institucional conciso da situação atual do Ethereum e se vale a pena operar agora.'}"

Sua tarefa: Forneça uma resposta direta, objetiva e pragmática em português, estruturada em no máximo 3 marcadores curtos e uma conclusão clara ("Operar" ou "Aguardar fora").
NUNCA use promessas irrealistas ou jargões vazios. Mantenha o tom profissional e direto.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ advisorText: response.text });
    } catch (err: any) {
      console.error('AI Advisor error:', err);
      res.status(500).json({
        advisorText: 'Erro ao consultar o assistente de IA. Tente novamente em instantes.'
      });
    }
  });

  // Serve Vite in dev, static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
