import {
  EthMarketData,
  DeFiStats,
  InstitutionalStats,
  InstitutionalTrackerStats,
  SentimentStats,
  WhaleAlert,
  NewsItem,
  EventItem,
  BacktestSignalRecord,
  ScenarioPreset
} from '../types';

export function getScenarioData(scenario: ScenarioPreset): {
  market: EthMarketData;
  defi: DeFiStats;
  institutional: InstitutionalStats;
  sentiment: SentimentStats;
  whales: WhaleAlert[];
  news: NewsItem[];
  events: EventItem[];
  backtest: BacktestSignalRecord[];
} {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Base live market defaults with organic live tick fluctuations using smooth harmonic oscillators
  const secondsTick = Math.floor(now.getTime() / 15000); // ticks every 15s
  const osc1 = Math.sin(secondsTick * 0.5);
  const osc2 = Math.cos(secondsTick * 0.9);
  const osc3 = Math.sin(secondsTick * 1.4);

  const tickOffset = Number((osc1 * 1.8 + osc2 * 0.9).toFixed(2));
  
  let price = 3247.50 + tickOffset;
  let change24h = Number((1.85 + (tickOffset / 100)).toFixed(2));
  let rsi = Number((48.5 + osc1 * 8.5 + osc2 * 3.2).toFixed(1));
  let funding = Number((0.0008 + osc2 * 0.0004).toFixed(5));
  let support = Math.round(price * 0.962);
  let resistance = Math.round(price * 1.038);
  let gas = Math.max(12, Math.round(18 + osc2 * 8 + osc3 * 3));
  let stableFlow = Number((28.5 + osc3 * 26.0).toFixed(1));
  let etfToday = Number((42.1 + osc1 * 22.0).toFixed(1));
  let fearGreed = Math.max(10, Math.min(90, Math.round(46 + osc2 * 6)));
  let fearGreedLabel: 'Medo Extremo' | 'Medo' | 'Neutro' | 'Ganância' | 'Ganância Extrema' = 
    fearGreed < 25 ? 'Medo Extremo' : fearGreed < 45 ? 'Medo' : fearGreed <= 55 ? 'Neutro' : fearGreed <= 75 ? 'Ganância' : 'Ganância Extrema';
  let galaxyScore = Math.round(64 + osc1 * 8);
  let atr14 = Number((price * 0.024 + osc3 * 6.5).toFixed(2)); // ATR 14 volatility in USD (~$75 - $88)

  if (scenario === 'bullish_surge') {
    price = 3185.00;
    change24h = -0.8;
    rsi = 31.2; // Oversold near strong support
    funding = -0.0002; // Negative funding
    support = Math.round(price * 0.968);
    resistance = Math.round(price * 1.042);
    gas = 16;
    stableFlow = 88.0; // +$88M stablecoin inflow
    etfToday = 94.5; // Huge ETF inflow
    fearGreed = 32; // Extreme fear/pessimism = contrarian buy
    fearGreedLabel = 'Medo';
    galaxyScore = 82;
    atr14 = 82.50;
  } else if (scenario === 'bearish_dump') {
    price = 3480.00;
    change24h = +5.2;
    rsi = 77.4; // Overbought near resistance
    funding = 0.018; // High funding longs
    support = Math.round(price * 0.955);
    resistance = Math.round(price * 1.032);
    gas = 68;
    stableFlow = -62.0; // Stablecoin outflow
    etfToday = -48.2; // ETF outflow
    fearGreed = 81; // Extreme greed
    fearGreedLabel = 'Ganância Extrema';
    galaxyScore = 38;
    atr14 = 108.20;
  } else if (scenario === 'whale_panic') {
    price = 3090.00;
    change24h = -4.5;
    rsi = 26.5;
    funding = -0.0012;
    support = Math.round(price * 0.960);
    resistance = Math.round(price * 1.040);
    gas = 42;
    stableFlow = 110.0; // High dip buying stablecoins
    etfToday = 18.0;
    fearGreed = 22;
    fearGreedLabel = 'Medo Extremo';
    galaxyScore = 78;
    atr14 = 124.50;
  } else if (scenario === 'neutral_wait') {
    price = 3250.00;
    change24h = 0.12;
    rsi = 51.0;
    funding = 0.0005;
    support = Math.round(price * 0.962);
    resistance = Math.round(price * 1.038);
    gas = 22;
    stableFlow = 12.0;
    etfToday = 8.5;
    fearGreed = 50;
    fearGreedLabel = 'Neutro';
    galaxyScore = 55;
    atr14 = 72.00;
  }

  const market: EthMarketData = {
    price,
    change24h,
    high24h: Math.round(price * 1.028),
    low24h: Math.round(price * 0.982),
    volume24hUsd: 18_420_000_000,
    gasPriceGwei: gas,
    rsi14: rsi,
    fundingRate: funding,
    technicalSupport: support,
    technicalResistance: resistance,
    atr14,
    lastUpdated: timeStr
  };

  const defi: DeFiStats = {
    tvlEth: 18_920_000,
    tvlUsd: 45_820_000_000,
    tvlChange24h: scenario === 'bullish_surge' ? 3.4 : scenario === 'bearish_dump' ? -2.8 : 0.9,
    topProtocols: [
      { name: 'Lido Staking', tvlUsd: 22_400_000_000, category: 'Liquid Staking', sharePercent: 48.8 },
      { name: 'Aave V3', tvlUsd: 8_200_000_000, category: 'Lending', sharePercent: 17.9 },
      { name: 'EigenLayer', tvlUsd: 6_900_000_000, category: 'Restaking', sharePercent: 15.0 },
      { name: 'Maker / Sky', tvlUsd: 5_100_000_000, category: 'CDP Stablecoin', sharePercent: 11.1 },
      { name: 'Uniswap V3', tvlUsd: 3_220_000_000, category: 'DEX', sharePercent: 7.2 }
    ],
    stablecoinTotalUsd: 82_400_000_000,
    stablecoinFlow24hUsd: stableFlow * 1_000_000
  };

  // Institutional Strategy Tracker Algorithmic Analytics
  let trackerData: InstitutionalTrackerStats;

  if (scenario === 'bearish_dump' || scenario === 'whale_panic') {
    trackerData = {
      dumpThreatLevel: 'RISCO CRÍTICO DE DUMP',
      dumpProbabilityPercent: 88,
      stealthSellingVolume24hEth: 48500,
      icebergSellWallEth: 22400,
      openInterestDivergenceScore: 38.5,
      exchangeInflowSpikeRatio: 4.2,
      recommendation: 'ALERTA MÁXIMO DE QUEDA: Algoritmos institucionais estão executando vendas fracionadas TWAP na Binance e Coinbase. Abertura massiva de posições vendidas em contratos futuros detectada.',
      activePatterns: [
        {
          id: 'pat_1',
          name: 'Distribuição Furtiva TWAP (Iceberg)',
          type: 'bearish_dump',
          threatLevel: 'CRITICAL',
          volumeInvolvedEth: 32000,
          volumeInvolvedUsd: 32000 * price,
          detectedAt: 'Há 12 min',
          description: 'Ordens repetitivas de 350 ETH lançadas a cada 45 segundos para desovar grandes volumes na liquidez de varejo sem desabar o preço imediatamente.',
          probabilityOfDumpPercent: 92,
          keyIndicators: ['Execução algorítmica TWAP', 'Absorção de ordens limitadas de compra', 'Queda contínua com volume oculto']
        },
        {
          id: 'pat_2',
          name: 'Montagem de Shorts Institucionais (OI Spike)',
          type: 'bearish_dump',
          threatLevel: 'HIGH',
          volumeInvolvedEth: 16500,
          volumeInvolvedUsd: 16500 * price,
          detectedAt: 'Há 28 min',
          description: 'Aumento expressivo de Open Interest (+38.5%) enquanto o spot recua, sinalizando entrada pesada de apostas na queda por fundos quantitativos.',
          probabilityOfDumpPercent: 84,
          keyIndicators: ['Aumento de OI sem valorização do spot', 'Taxa de financiamento virando negativa', 'Pressão vendedora em derivativos']
        },
        {
          id: 'pat_3',
          name: 'Parede de Contenção Spoofing no Ask',
          type: 'bearish_dump',
          threatLevel: 'HIGH',
          volumeInvolvedEth: 22400,
          volumeInvolvedUsd: 22400 * price,
          detectedAt: 'Há 45 min',
          description: 'Muralha sintética de venda posicionada na resistência chave para travar a alta e empurrar o preço em direção às liquidações.',
          probabilityOfDumpPercent: 78,
          keyIndicators: ['Livro de ofertas desbalanceado no Ask', 'Cancelamento de ordens no topo ao se aproximar']
        }
      ]
    };
  } else if (scenario === 'bullish_surge') {
    trackerData = {
      dumpThreatLevel: 'ESTÁVEL / ACUMULAÇÃO',
      dumpProbabilityPercent: 12,
      stealthSellingVolume24hEth: 2800,
      icebergSellWallEth: 1400,
      openInterestDivergenceScore: -14.2,
      exchangeInflowSpikeRatio: 0.5,
      recommendation: 'BAIXO RISCO DE DUMP: Mesas institucionais operando em acúmulo contínuo OTC e compras a mercado via fundos de investimento ETF.',
      activePatterns: [
        {
          id: 'pat_b1',
          name: 'Acúmulo Institucional Gradual (OTC Absorption)',
          type: 'bullish_accumulation',
          threatLevel: 'LOW',
          volumeInvolvedEth: 45000,
          volumeInvolvedUsd: 45000 * price,
          detectedAt: 'Há 20 min',
          description: 'Transferências diretas fora do livro de ofertas absorvendo liquidez disponível e reduzindo reservas de corretoras.',
          probabilityOfDumpPercent: 8,
          keyIndicators: ['Saídas expressivas de exchanges', 'Aumento fixo no holdings de ETFs']
        }
      ]
    };
  } else {
    trackerData = {
      dumpThreatLevel: 'ALERTA ELEVADO',
      dumpProbabilityPercent: 62,
      stealthSellingVolume24hEth: 18400,
      icebergSellWallEth: 8900,
      openInterestDivergenceScore: 18.4,
      exchangeInflowSpikeRatio: 2.1,
      recommendation: 'ATENÇÃO REFORÇADA: Algoritmos detectaram fracionamento de ordens de venda acima dos níveis atuais. Monitorar suporte para evitar liquidações.',
      activePatterns: [
        {
          id: 'pat_n1',
          name: 'Fracionamento Estratégico de Venda (Iceberg)',
          type: 'bearish_dump',
          threatLevel: 'HIGH',
          volumeInvolvedEth: 18400,
          volumeInvolvedUsd: 18400 * price,
          detectedAt: 'Há 18 min',
          description: 'Blocos de 200 ETH posicionados em leilões de arbitragem reduzindo o momentum comprador nas corretoras.',
          probabilityOfDumpPercent: 65,
          keyIndicators: ['Resistência persistente no Ask', 'Micro-picos de volume na venda']
        },
        {
          id: 'pat_n2',
          name: 'Aumento de Open Interest com Hedges Defensivos',
          type: 'bearish_dump',
          threatLevel: 'MODERATE',
          volumeInvolvedEth: 9200,
          volumeInvolvedUsd: 9200 * price,
          detectedAt: 'Há 50 min',
          description: 'Posicionamento defensivo de fundos de hedge com vendas em derivativos para proteção de carteira.',
          probabilityOfDumpPercent: 58,
          keyIndicators: ['Elevação de Open Interest com preço lateral', 'Funding Neutro/Levemente Baixista']
        }
      ]
    };
  }

  const institutional: InstitutionalStats = {
    etfNetFlowTodayUsd: etfToday * 1_000_000,
    etfNetFlow7dUsd: (etfToday * 4.2) * 1_000_000,
    etfFunds: [
      { fundName: 'iShares Ethereum Trust', ticker: 'ETHA', provider: 'BlackRock', holdingsEth: 920000, flow24hUsd: (etfToday * 0.55) * 1_000_000, flow7dUsd: 145000000 },
      { fundName: 'Fidelity Ethereum Fund', ticker: 'FETH', provider: 'Fidelity', holdingsEth: 480000, flow24hUsd: (etfToday * 0.32) * 1_000_000, flow7dUsd: 82000000 },
      { fundName: 'Bitwise Ethereum ETF', ticker: 'ETHW', provider: 'Bitwise', holdingsEth: 180000, flow24hUsd: (etfToday * 0.18) * 1_000_000, flow7dUsd: 38000000 },
      { fundName: 'Grayscale Ethereum Trust', ticker: 'ETHE', provider: 'Grayscale', holdingsEth: 1650000, flow24hUsd: (etfToday * -0.05) * 1_000_000, flow7dUsd: -42000000 }
    ],
    soprMetric: scenario === 'bullish_surge' ? 0.98 : scenario === 'bearish_dump' ? 1.06 : 1.01,
    exchangeReserveChangeEth24h: scenario === 'bullish_surge' ? -18400 : scenario === 'bearish_dump' ? +22500 : -2100,
    nasdaqCorrelation: 0.78,
    tracker: trackerData
  };

  const sentiment: SentimentStats = {
    fearAndGreedIndex: fearGreed,
    fearAndGreedLabel: fearGreedLabel,
    fearAndGreedChange24h: -3,
    galaxyScore: galaxyScore,
    socialDominance: 14.8,
    altRank: 2,
    socialBuzzVolume24h: 184500
  };

  const whales: WhaleAlert[] = [
    {
      id: 'w1',
      timestamp: 'Há 14 min',
      amountEth: 18500,
      amountUsd: 18500 * price,
      fromLabel: 'Coinbase Custody',
      toLabel: 'Wallet Desconhecida (0x7a2...f41)',
      direction: 'exchange_to_wallet',
      txHash: '0x8f2a...9d1c',
      isHot: true
    },
    {
      id: 'w2',
      timestamp: 'Há 38 min',
      amountEth: 25000,
      amountUsd: 25000 * price,
      fromLabel: 'Wallet Institucional (0x3b1...)',
      toLabel: 'Binance Hot Wallet',
      direction: scenario === 'bearish_dump' ? 'wallet_to_exchange' : 'exchange_to_wallet',
      txHash: '0x4c8e...1b9a',
      isHot: scenario === 'bearish_dump'
    },
    {
      id: 'w3',
      timestamp: 'Há 1h 20m',
      amountEth: 42000,
      amountUsd: 42000 * price,
      fromLabel: 'Lido Staking Unstake',
      toLabel: 'Kraken Institutional',
      direction: 'wallet_to_exchange',
      txHash: '0x1d3f...6e2b',
      isHot: false
    },
    {
      id: 'w4',
      timestamp: 'Há 2h 45m',
      amountEth: 12000,
      amountUsd: 12000 * price,
      fromLabel: 'Binance',
      toLabel: 'Arbitrum Bridge',
      direction: 'exchange_to_wallet',
      txHash: '0x9a4c...3e1d',
      isHot: false
    }
  ];

  let news: NewsItem[] = [];

  if (scenario === 'bullish_surge') {
    news = [
      {
        id: 'n_b1',
        title: 'SEC autoriza inclusão de Yield de Staking em ETFs Spot de Ethereum',
        source: 'Bloomberg Crypto',
        url: 'https://bloomberg.com',
        publishedAt: 'Há 12 min',
        impact: 'high',
        sentiment: 'positive',
        category: 'SEC/Regulação',
        summary: 'Comentários regulatórios favoráveis abrem caminho para dividendos de staking direto nos veículos da BlackRock e Fidelity.'
      },
      {
        id: 'n_b2',
        title: 'BlackRock registra aporte diário recorde de +$145M no ETF Spot (ETHA)',
        source: 'CoinDesk',
        url: 'https://coindesk.com',
        publishedAt: 'Há 35 min',
        impact: 'high',
        sentiment: 'positive',
        category: 'ETF',
        summary: 'Aceleração de capital vindo de fundos de pensão impulsiona liquidez e compra líquida no mercado à vista.'
      },
      {
        id: 'n_b3',
        title: 'Atualização Pectra concluída em Devnet com 90% de economia em taxas L2',
        source: 'Ethereum Foundation',
        url: 'https://ethereum.org',
        publishedAt: 'Há 1 hora',
        impact: 'medium',
        sentiment: 'positive',
        category: 'Upgrade/Network',
        summary: 'Rede de testes valida novidades técnicas do próximo hard fork sem falhas de consenso.'
      }
    ];
  } else if (scenario === 'bearish_dump') {
    news = [
      {
        id: 'n_d1',
        title: 'SEC envia notificações sobre custódia e staking de liquidez para protocolos DeFi',
        source: 'Reuters Crypto',
        url: 'https://reuters.com',
        publishedAt: 'Há 18 min',
        impact: 'high',
        sentiment: 'negative',
        category: 'SEC/Regulação',
        summary: 'Ação regulatória surpresa traz aversão ao risco e liquidação imediata de posições alavancadas em derivativos.'
      },
      {
        id: 'n_d2',
        title: 'Resgates líquidos em ETFs Spot de ETH atingem -$68M em único dia',
        source: 'Farside Investors',
        url: 'https://farside.co.uk',
        publishedAt: 'Há 40 min',
        impact: 'high',
        sentiment: 'negative',
        category: 'ETF',
        summary: 'Investidores institucionais reduzem exposição temporariamente devido a incertezas macroeconômicas.'
      }
    ];
  } else if (scenario === 'whale_panic') {
    news = [
      {
        id: 'n_w1',
        title: 'Baleia histórica de 2017 envia 35,000 ETH para Binance ativando medo de despejo',
        source: 'Whale Alert Feed',
        url: 'https://whale-alert.io',
        publishedAt: 'Há 8 min',
        impact: 'high',
        sentiment: 'negative',
        category: 'Geral',
        summary: 'Movimentação atípica de carteira adormecida pressiona livro de ordens e ativa stop loss encadeado.'
      },
      {
        id: 'n_w2',
        title: 'Mesas quantitativas de Wall Street posicionam ordens massivas de compra em $3,050',
        source: 'Coinglass Insights',
        url: 'https://coinglass.com',
        publishedAt: 'Há 22 min',
        impact: 'high',
        sentiment: 'positive',
        category: 'Macro',
        summary: 'Suporte de valor justo é defendido por arbitradores atentos à sobrevenda e desconto no preço.'
      }
    ];
  } else {
    news = [
      {
        id: 'n1',
        title: 'BlackRock registra entrada de +$94M no ETF Spot de Ethereum após acúmulo de fundos',
        source: 'CoinDesk',
        url: 'https://coindesk.com',
        publishedAt: 'Há 25 min',
        impact: 'high',
        sentiment: 'positive',
        category: 'ETF',
        summary: 'Aportes institucionais nos ETFs Spot renovam fôlego dos gestores de Wall Street com forte demanda por yield de staking regulado.'
      },
      {
        id: 'n2',
        title: 'Atualização Pectra da rede Ethereum entra na fase final de testes em Devnet',
        source: 'Ethereum Foundation Blog',
        url: 'https://ethereum.org',
        publishedAt: 'Há 1 hora',
        impact: 'medium',
        sentiment: 'positive',
        category: 'Upgrade/Network',
        summary: 'A próxima grande atualização Pectra reduzirá taxas em L2s e permitirá abstração de conta nativa em wallets.'
      },
      {
        id: 'n3',
        title: 'Relatório Glassnode: Suprimento de ETH em corretoras atinge menor nível em 8 anos',
        source: 'Glassnode Insights',
        url: 'https://glassnode.com',
        publishedAt: 'Há 3 horas',
        impact: 'medium',
        sentiment: 'positive',
        category: 'Geral',
        summary: 'Mais de 28% do supply total de ETH se encontra travado em Staking e pontes DeFi, encolhendo a oferta líquida nas exchanges.'
      }
    ];
  }

  const events: EventItem[] = [
    {
      id: 'e1',
      date: '12 Ago 2026',
      title: 'Relatório de Inflação CPI (EUA)',
      category: 'FOMC',
      impact: 'high',
      description: 'Divulgação dos dados de inflação ao consumidor americano que impactam o apetite ao risco global.'
    },
    {
      id: 'e2',
      date: '28 Ago 2026',
      title: 'Vencimento Mensal de Opções ETH ($2.4B)',
      category: 'Opções',
      impact: 'high',
      description: 'Maior vencimento do mês na Deribit com Max Pain calculado em $3,200.'
    },
    {
      id: 'e3',
      date: '15 Set 2026',
      title: 'Devnet Pectra Testnet Hardfork',
      category: 'Upgrade',
      impact: 'medium',
      description: 'Lançamento em testnet pública da maior atualização do Ethereum desde o Dencun.'
    }
  ];

  const backtest: BacktestSignalRecord[] = [
    {
      id: 'bt1',
      date: '03 Ago 2026',
      type: 'BUY',
      entryPrice: 3120,
      targetPrice: 3250,
      stopLossPrice: 3050,
      exitPrice: 3250,
      returnPercent: 4.17,
      isWin: true,
      confluenceScore: 84,
      holdingHours: 6.5,
      keyDrivers: ['ETF Inflow +$82M', 'RSI 32 Suporte Testado', 'Baleia acumulou 22K ETH']
    },
    {
      id: 'bt2',
      date: '01 Ago 2026',
      type: 'BUY',
      entryPrice: 3280,
      targetPrice: 3410,
      stopLossPrice: 3210,
      exitPrice: 3410,
      returnPercent: 3.96,
      isWin: true,
      confluenceScore: 78,
      holdingHours: 5.2,
      keyDrivers: ['Funding rate negativo', 'Stablecoin Inflow +$110M']
    },
    {
      id: 'bt3',
      date: '28 Jul 2026',
      type: 'SELL',
      entryPrice: 3520,
      targetPrice: 3380,
      stopLossPrice: 3590,
      exitPrice: 3380,
      returnPercent: 3.98,
      isWin: true,
      confluenceScore: 82,
      holdingHours: 7.8,
      keyDrivers: ['Resistência $3,520', 'RSI 78 sobrecomprado', 'Whale depositou $45M em exchange']
    },
    {
      id: 'bt4',
      date: '24 Jul 2026',
      type: 'BUY',
      entryPrice: 3190,
      targetPrice: 3320,
      stopLossPrice: 3120,
      exitPrice: 3120,
      returnPercent: -2.19,
      isWin: false,
      confluenceScore: 76,
      holdingHours: 4.0,
      keyDrivers: ['Volatilidade macro inesperada no anúncio do Fed - Stop loss executado com disciplina']
    },
    {
      id: 'bt5',
      date: '20 Jul 2026',
      type: 'BUY',
      entryPrice: 3050,
      targetPrice: 3180,
      stopLossPrice: 2980,
      exitPrice: 3180,
      returnPercent: 4.26,
      isWin: true,
      confluenceScore: 88,
      holdingHours: 8.0,
      keyDrivers: ['Fear & Greed em 22 (Medo Extremo)', 'BlackRock ETF recorde', 'Gas 12 gwei']
    }
  ];

  return { market, defi, institutional, sentiment, whales, news, events, backtest };
}
