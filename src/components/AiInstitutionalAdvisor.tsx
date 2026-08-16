import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface AiInstitutionalAdvisorProps {
  currentSetup: any;
}

export const AiInstitutionalAdvisor: React.FC<AiInstitutionalAdvisorProps> = ({ currentSetup }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleAsk = async (userPrompt?: string) => {
    const q = userPrompt || question;
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, currentSetup })
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer(data.advisorText);
      } else {
        setAnswer('Erro na consulta. Tente novamente.');
      }
    } catch (err) {
      setAnswer('Erro de conexão com o servidor de IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 font-mono">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" /> AI Quant Advisor
        </h3>

        <span className="text-[10px] text-blue-400 uppercase tracking-widest border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 rounded">
          Gemini 2.5
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-500 text-[11px] uppercase tracking-wider">Prompts:</span>
        <button
          onClick={() => {
            const p = 'Qual o impacto do fluxo atual dos ETFs no preço do ETH para as próximas 6 horas?';
            setQuestion(p);
            handleAsk(p);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-slate-200 text-[11px]"
        >
          ETF Impact
        </button>
        <button
          onClick={() => {
            const p = 'Analise a divergência entre o RSI e o movimento de baleias hoje.';
            setQuestion(p);
            handleAsk(p);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-slate-200 text-[11px]"
        >
          Whales vs RSI
        </button>
      </div>

      {/* Custom Question Input */}
      <div className="flex items-center gap-2 font-mono">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Query AI advisor..."
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          className="flex-1 bg-slate-900/50 text-slate-200 text-xs rounded-xl px-3.5 py-2 border border-slate-800 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Query</span>
        </button>
      </div>

      {/* Answer Output */}
      {answer && (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};
