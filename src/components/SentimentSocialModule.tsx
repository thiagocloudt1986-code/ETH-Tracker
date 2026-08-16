import React from 'react';
import { Activity, Flame, Share2, Globe, HeartHandshake } from 'lucide-react';
import { SentimentStats } from '../types';

interface SentimentSocialModuleProps {
  sentiment: SentimentStats;
}

export const SentimentSocialModule: React.FC<SentimentSocialModuleProps> = ({ sentiment }) => {
  // Color logic for Fear & Greed
  const getFearColor = (val: number) => {
    if (val <= 30) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; // Extreme Fear = Opportunity
    if (val <= 45) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    if (val <= 55) return 'text-slate-300 bg-slate-800 border-slate-700';
    if (val <= 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20'; // Extreme Greed = Danger
  };

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 font-mono">
        <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Social Pulse</h4>
        <span className="text-[10px] text-slate-500 uppercase">LUNARCRUSH & ALTERNATIVE.ME</span>
      </div>

      <div className="grid grid-cols-2 gap-4 font-mono">
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Fear/Greed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-200">{sentiment.fearAndGreedIndex}</span>
            <span className="text-xs text-slate-400 font-semibold">({sentiment.fearAndGreedLabel})</span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full ${
                sentiment.fearAndGreedIndex <= 35 ? 'bg-green-500' : sentiment.fearAndGreedIndex >= 75 ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${sentiment.fearAndGreedIndex}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">Galaxy Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-400">{sentiment.galaxyScore}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Dominância: {sentiment.socialDominance}%</p>
        </div>
      </div>
    </div>
  );
};
