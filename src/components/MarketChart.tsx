import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { EthMarketData } from '../types';

interface MarketChartProps {
  market: EthMarketData;
}

export const MarketChart: React.FC<MarketChartProps> = ({ market }) => {
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '24H' | '7D'>('24H');

  // Generate chart data points proportional to timeframe and current market price
  const basePrice = market.price;
  const generateChartData = () => {
    const points = [];
    const count = 24;
    const volatilityMap = {
      '1H': 0.002,
      '4H': 0.005,
      '24H': 0.012,
      '7D': 0.035,
    };
    const vol = volatilityMap[timeframe];
    let tempPrice = basePrice * (1 - vol * 0.6);

    for (let i = 0; i < count; i++) {
      const label = timeframe === '7D' 
        ? `Dia ${Math.floor(i / 3) + 1}`
        : `${(i + 1).toString().padStart(2, '0')}:00`;

      const seed = (basePrice * 0.0001 + i * 0.618) % 1;
      const pseudoRand = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453 % 1;
      const randomNoise = (pseudoRand - 0.48) * (basePrice * vol * 0.4);
      tempPrice = i === count - 1 ? basePrice : tempPrice + randomNoise;

      points.push({
        time: label,
        price: Number(tempPrice.toFixed(2)),
      });
    }
    return points;
  };

  const data = generateChartData();

  // Dynamically compute min/max Y domain to include all price points, support, and resistance cleanly
  const allPrices = data.map((d) => d.price).concat([market.price, market.technicalSupport, market.technicalResistance]);
  const minPriceVal = Math.min(...allPrices);
  const maxPriceVal = Math.max(...allPrices);
  const padding = (maxPriceVal - minPriceVal) * 0.12 || 40;

  const yDomainMin = Math.floor(minPriceVal - padding);
  const yDomainMax = Math.ceil(maxPriceVal + padding);

  // Calculate Pillar 1 Technical Impact Score (25% of total Confluence)
  let techScore = 50;
  const rsi = market.rsi14;
  if (rsi >= 25 && rsi <= 40) techScore += 25;
  else if (rsi >= 65 && rsi <= 80) techScore -= 25;

  const funding = market.fundingRate;
  if (funding <= 0.001) techScore += 15;
  else if (funding > 0.01) techScore -= 15;

  const distToSupport = ((market.price - market.technicalSupport) / market.price) * 100;
  const distToResist = ((market.technicalResistance - market.price) / market.price) * 100;
  if (distToSupport <= 1.5 && distToSupport >= -0.5) techScore += 20;
  else if (distToResist <= 1.5 && distToResist >= -0.5) techScore -= 20;

  techScore = Math.max(0, Math.min(100, techScore));
  const pillarWeightContrib = (techScore * 0.25).toFixed(1);

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/50 font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            ETH / USDT Technical Stream
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          {(['1H', '4H', '24H', '7D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Support & Resistance Indicators */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-0.5 bg-rose-500 rounded-full" />
          <span>
            Resistência: <strong className="text-rose-400 font-normal">${market.technicalResistance.toLocaleString()}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-0.5 bg-green-500 rounded-full" />
          <span>
            Suporte: <strong className="text-green-400 font-normal">${market.technicalSupport.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis
              domain={[yDomainMin, yDomainMax]}
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${Math.round(val).toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0C10',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Preço ETH']}
            />

            {/* Support and Resistance Reference Lines */}
            <ReferenceLine y={market.technicalResistance} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={market.technicalSupport} stroke="#22c55e" strokeDasharray="3 3" />

            <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEth)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Technical Indicators & Confluence Influence Breakdown */}
      <div className="pt-3 border-t border-slate-800/50 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <div>
            <span>RSI (14): </span>
            <span
              className={`font-semibold ${
                rsi <= 35 ? 'text-green-400' : rsi >= 65 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {rsi.toFixed(1)} {rsi <= 35 ? '(Sobrevendido)' : rsi >= 65 ? '(Sobrecomprado)' : '(Neutro)'}
            </span>
          </div>
          <div>
            <span>Funding Rate: </span>
            <span className="text-slate-200 font-semibold">{(funding * 100).toFixed(3)}%</span>
          </div>
        </div>

        {/* Algorithm Influence Explanation */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Influência no Sinal Final (Pillar 1 - 25%):</strong> Score Técnico {techScore}/100
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
            +{pillarWeightContrib} / 25 pts na Confluência
          </div>
        </div>
      </div>
    </div>
  );
};

