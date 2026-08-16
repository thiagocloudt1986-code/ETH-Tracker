import { ConfluenceFactor, ConfluenceSignal, EthMarketData, DeFiStats, InstitutionalStats, SentimentStats, WhaleAlert, NewsItem } from '../types';

export function calculateConfluence(
  market: EthMarketData,
  defi: DeFiStats,
  inst: InstitutionalStats,
  sentiment: SentimentStats,
  whales: WhaleAlert[],
  news?: NewsItem[]
): ConfluenceSignal {
  const factors: ConfluenceFactor[] = [];
  const rationale: string[] = [];

  // --- PILLAR 1: TECHNICAL ANALYSIS (25%) ---
  let techScore = 50;
  let techStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  // RSI Continuous Scaling: RSI 50 = 0, RSI 25 = +35, RSI 75 = -35
  const rsi = market.rsi14;
  const rsiDelta = (50 - rsi) * 1.4; // Responsive slope
  techScore += rsiDelta;

  if (rsi <= 35) {
    rationale.push(`RSI(14) em ${rsi.toFixed(1)} (região de sobrevenda extrema com forte pressão compradora)`);
  } else if (rsi >= 65) {
    rationale.push(`RSI(14) em ${rsi.toFixed(1)} (região sobrecomprada de resistência)`);
  }

  // Funding Rate Check (0.001 = neutral baseline)
  const funding = market.fundingRate;
  const fundingDelta = Math.max(-25, Math.min(25, (0.001 - funding) * 15000));
  techScore += fundingDelta;

  if (funding < 0) {
    rationale.push(`Funding Rate negativo (${(funding * 100).toFixed(3)}%) indica armadilha de shorts (Short Squeeze imminent)`);
  } else if (funding > 0.01) {
    rationale.push(`Funding Rate elevado (${(funding * 100).toFixed(3)}%) indica alavancagem compradora eufórica`);
  }

  // Support / Resistance Proximity Continuous
  const distToSupport = ((market.price - market.technicalSupport) / market.price) * 100;
  const distToResist = ((market.technicalResistance - market.price) / market.price) * 100;

  if (distToSupport >= 0 && distToSupport <= 4.5) {
    const suppBonus = (4.5 - distToSupport) * 6; // Up to +27
    techScore += suppBonus;
    if (distToSupport <= 2.0) {
      rationale.push(`Preço testando suporte institucional relevante em $${market.technicalSupport.toLocaleString('pt-BR')}`);
    }
  }
  if (distToResist >= 0 && distToResist <= 4.5) {
    const resPenalty = (4.5 - distToResist) * 6; // Up to -27
    techScore -= resPenalty;
    if (distToResist <= 2.0) {
      rationale.push(`Preço testando forte topo/resistência em $${market.technicalResistance.toLocaleString('pt-BR')}`);
    }
  }

  techScore = Math.max(0, Math.min(100, Math.round(techScore)));
  techStatus = techScore >= 65 ? 'bullish' : techScore <= 35 ? 'bearish' : 'neutral';
  const techExplanation = `RSI: ${rsi.toFixed(1)} | Funding: ${(funding * 100).toFixed(3)}% | Suporte: $${market.technicalSupport}`;

  factors.push({
    id: 'tech_p1',
    category: 'technical',
    label: 'Análise Técnica & Derivados',
    score: techScore,
    weight: 25,
    status: techStatus,
    value: `RSI ${rsi.toFixed(0)}`,
    conditionMet: techScore >= 70 || techScore <= 30,
    explanation: techExplanation
  });

  // --- PILLAR 2: ON-CHAIN & NETWORK (20%) ---
  let onchainScore = 50;
  let onchainStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  // Stablecoin flow continuous scaling ($M)
  const stableFlow = defi.stablecoinFlow24hUsd / 1_000_000;
  const stableDelta = Math.max(-35, Math.min(35, stableFlow * 0.5));
  onchainScore += stableDelta;

  if (stableFlow >= 35) {
    rationale.push(`Inflow relevante de liquidez em stablecoins (+$${stableFlow.toFixed(1)}M em 24h)`);
  } else if (stableFlow <= -35) {
    rationale.push(`Outflow de capital em stablecoins (-$${Math.abs(stableFlow).toFixed(1)}M em 24h)`);
  }

  // Gas Price continuous scaling (baseline 30 gwei)
  const gas = market.gasPriceGwei;
  const gasDelta = Math.max(-20, Math.min(20, (30 - gas) * 0.8));
  onchainScore += gasDelta;

  // TVL change continuous scaling
  const tvlDelta = Math.max(-25, Math.min(25, defi.tvlChange24h * 8.5));
  onchainScore += tvlDelta;

  onchainScore = Math.max(0, Math.min(100, Math.round(onchainScore)));
  onchainStatus = onchainScore >= 65 ? 'bullish' : onchainScore <= 35 ? 'bearish' : 'neutral';

  factors.push({
    id: 'onchain_p2',
    category: 'onchain',
    label: 'Métricas On-Chain & TVL',
    score: onchainScore,
    weight: 20,
    status: onchainStatus,
    value: `Gas ${gas} gwei | Stables ${stableFlow >= 0 ? '+' : ''}${stableFlow.toFixed(0)}M`,
    conditionMet: onchainScore >= 70 || onchainScore <= 30,
    explanation: `Fluxo Stablecoins 24h: $${stableFlow.toFixed(1)}M | Gas: ${gas} Gwei | TVL 24h: ${defi.tvlChange24h > 0 ? '+' : ''}${defi.tvlChange24h.toFixed(1)}%`
  });

  // --- PILLAR 3: INSTITUTIONAL & WHALES (30% WEIGHT - HEAVY WEIGHT) ---
  let instScore = 50;
  let instStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  // ETF Net Flow continuous scaling ($M)
  const etfTodayM = inst.etfNetFlowTodayUsd / 1_000_000;
  const etfDelta = Math.max(-42, Math.min(42, etfTodayM * 0.55));
  instScore += etfDelta;

  if (etfTodayM >= 25) {
    rationale.push(`Inflow líquido institucional em ETFs Spot ETH de +$${etfTodayM.toFixed(1)}M`);
  } else if (etfTodayM <= -25) {
    rationale.push(`Resgate líquido em ETFs Spot ETH de -$${Math.abs(etfTodayM).toFixed(1)}M`);
  }

  // Whale activity check
  const recentWhales = whales.filter(w => w.isHot);
  const dumpWhales = recentWhales.filter(w => w.direction === 'wallet_to_exchange');
  const accumWhales = recentWhales.filter(w => w.direction === 'exchange_to_wallet');
  const whaleDelta = Math.max(-30, Math.min(30, (accumWhales.length - dumpWhales.length) * 12));
  instScore += whaleDelta;

  // Institutional Strategy Tracker Continuous Percentage Calculation
  if (inst.tracker) {
    const t = inst.tracker;
    
    // 1. Dump Probability Direct Percentage Impact: (50 - dumpProbabilityPercent) * 0.45
    const dumpProbImpact = Number(((50 - t.dumpProbabilityPercent) * 0.45).toFixed(1)); // e.g. 88% prob -> -17.1 pts
    
    // 2. Short Open Interest Divergence Impact:
    const oiImpact = Number((t.openInterestDivergenceScore > 0 ? -(t.openInterestDivergenceScore * 0.4) : Math.abs(t.openInterestDivergenceScore) * 0.3).toFixed(1));
    
    // 3. Exchange Inflow Spike Ratio Impact:
    const inflowImpact = Number((t.exchangeInflowSpikeRatio > 1.0 ? -(t.exchangeInflowSpikeRatio - 1.0) * 5.0 : 5.0).toFixed(1));
    
    // 4. Stealth Selling Volume (TWAP) Impact:
    const stealthImpact = Number((-(t.stealthSellingVolume24hEth / 2500)).toFixed(1));

    // 5. Iceberg Sell Wall Impact:
    const icebergImpact = Number((-(t.icebergSellWallEth / 2000)).toFixed(1));

    const totalTrackerDelta = Math.max(-45, Math.min(30, Math.round(dumpProbImpact + oiImpact + inflowImpact + stealthImpact + icebergImpact)));

    instScore += totalTrackerDelta;
    
    rationale.push(
      `[RASTREADOR INSTITUCIONAL - IMPACTO % NO SINAL] ` +
      `Prob. Dump (${t.dumpProbabilityPercent}% → ${dumpProbImpact >= 0 ? '+' : ''}${dumpProbImpact} pts) | ` +
      `OI Short (${t.openInterestDivergenceScore > 0 ? '+' : ''}${t.openInterestDivergenceScore}% → ${oiImpact >= 0 ? '+' : ''}${oiImpact} pts) | ` +
      `Spike Inflow (${t.exchangeInflowSpikeRatio}x → ${inflowImpact >= 0 ? '+' : ''}${inflowImpact} pts) | ` +
      `TWAP Furtivo (${(t.stealthSellingVolume24hEth/1000).toFixed(1)}k ETH → ${stealthImpact} pts) | ` +
      `Barreira Iceberg (${(t.icebergSellWallEth/1000).toFixed(1)}k ETH → ${icebergImpact} pts). ` +
      `Ajuste Institucional Líquido: ${totalTrackerDelta >= 0 ? '+' : ''}${totalTrackerDelta} pts.`
    );
  }

  if (accumWhales.length > dumpWhales.length) {
    rationale.push(`Acúmulo de baleias: ${accumWhales.length} saídas de exchanges para custódia fria`);
  } else if (dumpWhales.length > accumWhales.length) {
    rationale.push(`Pressão vendedora de baleias: ${dumpWhales.length} aportes em corretoras`);
  }

  instScore = Math.max(0, Math.min(100, Math.round(instScore)));
  instStatus = instScore >= 65 ? 'bullish' : instScore <= 35 ? 'bearish' : 'neutral';

  factors.push({
    id: 'inst_p3',
    category: 'institutional',
    label: 'Fluxo Institucional & ETFs',
    score: instScore,
    weight: 30,
    status: instStatus,
    value: `ETF Flow: ${etfTodayM >= 0 ? '+' : ''}$${etfTodayM.toFixed(1)}M`,
    conditionMet: instScore >= 70 || instScore <= 30,
    explanation: `Fluxo de ETF 24h: $${etfTodayM.toFixed(1)}M | Baleias: ${accumWhales.length} Acúmulos / ${dumpWhales.length} Depósitos`
  });

  // --- PILLAR 4: SENTIMENT, SOCIAL & GLOBAL NEWS (30% WEIGHT - HEAVY WEIGHT) ---
  let sentScore = 50;
  let sentStatus: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  // Fear & Greed contrarian logic (baseline 50)
  const fg = sentiment.fearAndGreedIndex;
  const fgDelta = Math.max(-25, Math.min(25, (50 - fg) * 0.7));
  sentScore += fgDelta;

  if (fg <= 35) {
    rationale.push(`Sentimento em Medo (${fg}/100) - sinal contrariador de compra acumulativa`);
  } else if (fg >= 75) {
    rationale.push(`Ganância Extrema (${fg}/100) alerta para risco de sobreaquecimento`);
  }

  // LunarCrush Galaxy Score (baseline 50)
  const galaxyDelta = Math.max(-20, Math.min(20, (sentiment.galaxyScore - 50) * 0.6));
  sentScore += galaxyDelta;

  // News Sentiment Analysis (Integrates breaking macro, ETF & regulatory news)
  let newsDelta = 0;
  let positiveNewsCount = 0;
  let negativeNewsCount = 0;

  if (news && news.length > 0) {
    news.forEach((item) => {
      const weight = item.impact === 'high' ? 15 : item.impact === 'medium' ? 8 : 3;
      if (item.sentiment === 'positive') {
        newsDelta += weight;
        positiveNewsCount++;
        if (item.impact === 'high') {
          rationale.push(`[NOTÍCIA ALTO IMPACTO (+)] ${item.title}`);
        }
      } else if (item.sentiment === 'negative') {
        newsDelta -= weight;
        negativeNewsCount++;
        if (item.impact === 'high') {
          rationale.push(`[NOTÍCIA ALTO IMPACTO (-)] ${item.title}`);
        }
      }
    });
  }

  newsDelta = Math.max(-40, Math.min(40, newsDelta));
  sentScore += newsDelta;

  sentScore = Math.max(0, Math.min(100, Math.round(sentScore)));
  sentStatus = sentScore >= 65 ? 'bullish' : sentScore <= 35 ? 'bearish' : 'neutral';

  const newsSummaryStr = news && news.length > 0
    ? ` | Notícias: ${positiveNewsCount} Boadas / ${negativeNewsCount} Urso`
    : '';

  factors.push({
    id: 'sent_p4',
    category: 'sentiment',
    label: 'Sentimento Social & Notícias Globais',
    score: sentScore,
    weight: 30,
    status: sentStatus,
    value: `Fear&Greed: ${fg} (${sentiment.fearAndGreedLabel})`,
    conditionMet: sentScore >= 70 || sentScore <= 30,
    explanation: `Fear & Greed: ${fg} | Galaxy Score: ${sentiment.galaxyScore}/100${newsSummaryStr}`
  });

  // --- TOTAL WEIGHTED CONFLUENCE CALCULATION WITH HIGH CONVICTION SYNERGY ---
  // Base Weighted Score: Inst (30%) + News (30%) + Tech (20%) + OnChain (20%)
  const weightedBaseScore =
    instScore * 0.30 + sentScore * 0.30 + techScore * 0.20 + onchainScore * 0.20;

  let finalExpandedScore = weightedBaseScore;

  if (weightedBaseScore > 50) {
    // Bullish Expansion toward 100
    const bullishPillarsCount = [techScore, onchainScore, instScore, sentScore].filter(
      (s) => s >= 60
    ).length;

    const alignmentMultiplier =
      1.0 + (bullishPillarsCount >= 4 ? 0.35 : bullishPillarsCount >= 3 ? 0.22 : bullishPillarsCount >= 2 ? 0.12 : 0.05);

    const etfInflowBoost = etfTodayM >= 40 ? 0.15 : etfTodayM >= 20 ? 0.08 : 0;
    const highNewsBoost = positiveNewsCount > 0 ? 0.12 : 0;

    const totalBullishMultiplier = alignmentMultiplier + etfInflowBoost + highNewsBoost;

    finalExpandedScore = 50 + (weightedBaseScore - 50) * totalBullishMultiplier;
  } else if (weightedBaseScore < 50) {
    // Bearish Expansion toward 0
    const bearishPillarsCount = [techScore, onchainScore, instScore, sentScore].filter(
      (s) => s <= 40
    ).length;

    const alignmentMultiplier =
      1.0 + (bearishPillarsCount >= 4 ? 0.35 : bearishPillarsCount >= 3 ? 0.22 : bearishPillarsCount >= 2 ? 0.12 : 0.05);

    const etfOutflowPenalty = etfTodayM <= -30 ? 0.15 : etfTodayM <= -15 ? 0.08 : 0;
    const highNewsPenalty = negativeNewsCount > 0 ? 0.12 : 0;

    const totalBearishMultiplier = alignmentMultiplier + etfOutflowPenalty + highNewsPenalty;

    finalExpandedScore = 50 - (50 - weightedBaseScore) * totalBearishMultiplier;
  }

  const totalScore = Math.max(0, Math.min(100, Math.round(finalExpandedScore)));

  let status: 'NEUTRAL' | 'BUY' | 'SELL' = 'NEUTRAL';
  let confidence = 0;
  let targetPrice: number | null = null;
  let stopLoss: number | null = null;
  let riskRewardRatio: number | null = null;
  let profitMarginPercent: number | null = null;
  let isRiskRewardFilterVetoed = false;
  let vetoReason = '';
  const currentPrice = market.price;

  // ATR (AVERAGE TRUE RANGE) VOLATILITY MODEL FOR TARGET & STOP LOSS
  const atr14 = market.atr14 || Number((currentPrice * 0.024).toFixed(2));

  // Count Pillar Alignment for Hysteresis / Noise Dampening
  const bullishPillars = [techScore, onchainScore, instScore, sentScore].filter(s => s >= 60).length;
  const bearishPillars = [techScore, onchainScore, instScore, sentScore].filter(s => s <= 40).length;

  // MATURE INSTITUTIONAL RISK FILTER & SOLID BUY EXECUTION MODEL
  if (totalScore >= 70 && bullishPillars >= 2) {
    // 1. Calculate Tight Invalidation Stop Loss (1.2x ATR) and Expansion Target (3.0x ATR)
    let rawStop = Math.round(currentPrice - 1.2 * atr14);
    let rawTarget = Math.round(currentPrice + 3.0 * atr14);

    // Refine Stop Loss with technical support structure if support is nearby
    const suppDist = currentPrice - market.technicalSupport;
    if (suppDist > 0 && suppDist <= 1.8 * atr14) {
      rawStop = Math.min(rawStop, Math.round(market.technicalSupport - 0.2 * atr14));
    }

    // Refine Target with technical resistance structure if resistance is higher
    const resistDist = market.technicalResistance - currentPrice;
    if (resistDist >= 2.0 * atr14) {
      rawTarget = Math.max(rawTarget, Math.round(market.technicalResistance));
    }

    // Check Resistance Wall Proximity
    const isTooCloseToResistance = resistDist > 0 && resistDist < 1.2 * atr14;

    let potentialGainPct = Number((((rawTarget - currentPrice) / currentPrice) * 100).toFixed(2));
    let potentialRiskPct = Number((((currentPrice - rawStop) / currentPrice) * 100).toFixed(2));

    let computedRr = potentialRiskPct > 0 
      ? Number((potentialGainPct / potentialRiskPct).toFixed(2))
      : 0;

    // Guarantee minimum 2.0x R/R for solid buys if stop loss can be tightened to 1.1x ATR
    if (computedRr < 1.80 && !isTooCloseToResistance) {
      rawStop = Math.round(currentPrice - 1.05 * atr14);
      potentialRiskPct = Number((((currentPrice - rawStop) / currentPrice) * 100).toFixed(2));
      computedRr = Number((potentialGainPct / potentialRiskPct).toFixed(2));
    }

    targetPrice = rawTarget;
    stopLoss = rawStop;
    riskRewardRatio = computedRr;
    profitMarginPercent = potentialGainPct;

    const isInstitutionalDumpThreat = inst.tracker && (inst.tracker.dumpThreatLevel === 'RISCO CRÍTICO DE DUMP' || inst.tracker.dumpProbabilityPercent >= 75);

    if (isInstitutionalDumpThreat) {
      status = 'NEUTRAL';
      confidence = totalScore;
      isRiskRewardFilterVetoed = true;
      vetoReason = `ALERTA DE DESPEJO INSTITUCIONAL: O Rastreador Algorítmico identificou vendas furtivas em massa (${inst.tracker?.stealthSellingVolume24hEth.toLocaleString('pt-BR')} ETH via TWAP) e acúmulo de posições vendidas em derivativos. Risco de queda iminente (${inst.tracker?.dumpProbabilityPercent}% prob). Entrada de compra suspensa por segurança.`;
      rationale.push(`[SISTEMA DE PROTEÇÃO ANTI-TRAP] Entrada de COMPRA bloqueada pois algoritmos institucionais estão desovando grandes volumes antes de uma possível forte queda.`);
    } else if (isTooCloseToResistance) {
      status = 'NEUTRAL';
      confidence = totalScore;
      isRiskRewardFilterVetoed = true;
      vetoReason = `Proteção de Risco: Preço em proximidade do topo de resistência ($${market.technicalResistance.toLocaleString('pt-BR')}). Para evitar comprar no topo, a entrada requer retração ao suporte ($${market.technicalSupport.toLocaleString('pt-BR')}) ou rompimento com volume.`;
      rationale.push(`[FILTRO INSTITUCIONAL DE RESISTÊNCIA] Preço próximo da resistência ($${market.technicalResistance.toLocaleString('pt-BR')}). Ordem pausada para garantir R/R sólido no pullback.`);
    } else if (computedRr >= 1.80) {
      status = 'BUY';
      confidence = Math.min(99, Math.round(totalScore * 0.96 + 3));
      isRiskRewardFilterVetoed = false;
      rationale.push(`[SINAL DE COMPRA CONFIRMADO - ALTA SOLIDEZ] Excelente Relação Risco/Retorno (${computedRr}x) com Stop Invalidação em $${rawStop.toLocaleString('pt-BR')} e Alvo de Expansão em $${rawTarget.toLocaleString('pt-BR')}.`);
    } else {
      status = 'NEUTRAL';
      confidence = totalScore;
      isRiskRewardFilterVetoed = true;
      vetoReason = `Sinal de COMPRA em observação: Relação R/R (${computedRr}x) abaixo do limiar institucional (exige R/R ≥ 1.80x).`;
      rationale.push(`[FILTRO DE RISCO MATURO] Entrada suspensa por R/R insuficiente (${computedRr}x).`);
    }
  } else if (totalScore <= 30 && bearishPillars >= 2) {
    // Potential SELL setup using tight stop and expansion target
    let rawStop = Math.round(currentPrice + 1.2 * atr14);
    let rawTarget = Math.round(currentPrice - 3.0 * atr14);

    const resistDist = market.technicalResistance - currentPrice;
    if (resistDist > 0 && resistDist <= 1.8 * atr14) {
      rawStop = Math.max(rawStop, Math.round(market.technicalResistance + 0.2 * atr14));
    }

    const suppDist = currentPrice - market.technicalSupport;
    if (suppDist >= 2.0 * atr14) {
      rawTarget = Math.min(rawTarget, Math.round(market.technicalSupport));
    }

    const isTooCloseToSupport = suppDist > 0 && suppDist < 1.2 * atr14;

    let potentialGainPct = Number((((currentPrice - rawTarget) / currentPrice) * 100).toFixed(2));
    let potentialRiskPct = Number((((rawStop - currentPrice) / currentPrice) * 100).toFixed(2));

    let computedRr = potentialRiskPct > 0 
      ? Number((potentialGainPct / potentialRiskPct).toFixed(2))
      : 0;

    if (computedRr < 1.80 && !isTooCloseToSupport) {
      rawStop = Math.round(currentPrice + 1.05 * atr14);
      potentialRiskPct = Number((((rawStop - currentPrice) / currentPrice) * 100).toFixed(2));
      computedRr = Number((potentialGainPct / potentialRiskPct).toFixed(2));
    }

    targetPrice = rawTarget;
    stopLoss = rawStop;
    riskRewardRatio = computedRr;
    profitMarginPercent = potentialGainPct;

    if (isTooCloseToSupport) {
      status = 'NEUTRAL';
      confidence = totalScore;
      isRiskRewardFilterVetoed = true;
      vetoReason = `Proteção de Risco: Preço em proximidade do fundo de suporte ($${market.technicalSupport.toLocaleString('pt-BR')}). Para evitar vender no fundo, aguarde repique à resistência ($${market.technicalResistance.toLocaleString('pt-BR')}) ou perda do suporte.`;
      rationale.push(`[FILTRO INSTITUCIONAL DE SUPORTE] Preço próximo do suporte ($${market.technicalSupport.toLocaleString('pt-BR')}). Venda pausada para evitar fundo de canal.`);
    } else if (computedRr >= 1.80) {
      status = 'SELL';
      confidence = Math.min(99, Math.round((100 - totalScore) * 0.96 + 3));
      isRiskRewardFilterVetoed = false;
      rationale.push(`[SINAL DE VENDA CONFIRMADO] Relação Risco/Retorno (${computedRr}x) com Stop de Invalidação em $${rawStop.toLocaleString('pt-BR')} e Alvo de Baixa em $${rawTarget.toLocaleString('pt-BR')}.`);
    } else {
      status = 'NEUTRAL';
      confidence = totalScore;
      isRiskRewardFilterVetoed = true;
      vetoReason = `Sinal de VENDA em observação: Relação R/R (${computedRr}x) abaixo do limiar institucional.`;
      rationale.push(`[FILTRO DE RISCO MATURO] Venda suspensa por R/R insuficiente (${computedRr}x).`);
    }
  } else {
    status = 'NEUTRAL';
    confidence = totalScore;
  }

  return {
    status,
    confidence,
    totalScore,
    targetPrice,
    stopLoss,
    riskRewardRatio,
    profitMarginPercent,
    entryPrice: currentPrice,
    rationale,
    factors,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isRiskRewardFilterVetoed,
    vetoReason
  };
}

