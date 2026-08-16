import React, { useState } from 'react';
import { Newspaper, Calendar, AlertCircle, ExternalLink, Filter, Sparkles } from 'lucide-react';
import { NewsItem, EventItem } from '../types';

interface NewsEventsModuleProps {
  news: NewsItem[];
  events: EventItem[];
}

export const NewsEventsModule: React.FC<NewsEventsModuleProps> = ({ news, events }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high'>('high');

  const filteredNews = news.filter((n) => (impactFilter === 'high' ? n.impact === 'high' : true));

  return (
    <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
        <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2 font-mono">
          High Impact Intel
          <span className="text-blue-400 font-normal">• {filteredNews.length} Intel</span>
        </h3>

        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              activeTab === 'news' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-400'
            }`}
          >
            News
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              activeTab === 'events' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'text-slate-400'
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {activeTab === 'news' ? (
        <div className="space-y-4">
          {/* News List */}
          <div className="space-y-3">
            {filteredNews.map((item) => (
              <div key={item.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div
                  className={`w-1 rounded-full shrink-0 ${
                    item.impact === 'high' ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">
                    {item.source} • {item.publishedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Events Calendar List */
        <div className="space-y-3 font-mono">
          {events.map((e) => (
            <div
              key={e.id}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-center shrink-0">
                  <span className="text-[9px] uppercase block text-slate-500">Date</span>
                  {e.date}
                </div>
                <div>
                  <span className="font-semibold text-slate-300 block">{e.title}</span>
                  <span className="text-[10px] text-slate-500">{e.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
