
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import AdSlot from './AdSlot';

interface SidebarProps {
  history: HistoryItem[];
  credits: number;
  isOpen: boolean;
  currentUser: string;
  onSelect: (item: HistoryItem) => void;
  onClose: () => void;
  onClear: () => void;
  onDeleteItem: (id: string | string[]) => void;
  onToggleFavorite: (id: string) => void;
  onRefillCredits: () => void;
  onLogout: () => void;
  currentId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  history, 
  credits,
  isOpen, 
  currentUser,
  onSelect, 
  onClose, 
  onClear, 
  onDeleteItem, 
  onToggleFavorite,
  onRefillCredits,
  onLogout,
  currentId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const groupedHistory = useMemo(() => {
    const pinned = filteredHistory.filter(item => item.isFavorite);
    const recent = filteredHistory.filter(item => !item.isFavorite);
    return { pinned, recent };
  }, [filteredHistory]);

  const renderSection = (title: string, items: HistoryItem[], icon?: React.ReactNode) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          {icon}
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{title} — {items.length}</h3>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group relative cursor-pointer glass rounded-2xl overflow-hidden transition-all duration-300 border ${item.id === currentId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt}
                  onError={(e) => (e.currentTarget.src = 'https://images.pollinations.ai/prompt/corrupt%20data%20glitch%20dark?nologo=true')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.isUpscaled && <span className="text-[7px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded shadow-lg">4K</span>}
                </div>
              </div>
              <div className="p-3 bg-white/[0.02]">
                <p className="text-[10px] text-gray-300 line-clamp-1 italic mb-1 font-medium">"{item.prompt}"</p>
                <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                  <span>{item.width}x{item.height}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-80 glass-dark z-50 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col border-r border-white/5 shadow-2xl`}>
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Operator</h4>
                <p className="text-sm font-black text-white uppercase tracking-tighter truncate">{currentUser}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Disconnect">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search history..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" 
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 opacity-20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Archive Empty</h4>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-gray-700 leading-relaxed">Synthesis records will appear here.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">No nodes found</p>
              <button onClick={() => setSearchQuery('')} className="text-[9px] text-blue-500 font-bold mt-2 uppercase underline">Clear Filter</button>
            </div>
          ) : (
            <>
              {renderSection("Pinned", groupedHistory.pinned, <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>)}
              {renderSection("Synthesis Log", groupedHistory.recent)}
              <AdSlot type="sidebar" className="mt-8" />
            </>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Neural Sync</span>
              <span className={`text-[10px] font-black font-mono ${credits === 0 ? 'text-red-500' : 'text-blue-500'}`}>{credits} / 8</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-700 ${credits === 0 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(credits / 8) * 100}%` }}></div>
            </div>
            <button onClick={onRefillCredits} className="w-full py-3 glass border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all">Refill Link</button>
          </div>
          <div className="flex items-center justify-between opacity-30 pt-2">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">Protocol v2.5</span>
            <button onClick={onClear} className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:opacity-100 transition-opacity">Flush Memory</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
