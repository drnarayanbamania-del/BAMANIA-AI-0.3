
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
      <div className="mb-10 last:mb-0">
        <div className="flex items-center gap-4 mb-6 px-2">
          {icon}
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60">{title} — {items.length}</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group relative cursor-pointer glass rounded-[36px] overflow-hidden transition-all duration-700 border-2 ${item.id === currentId ? 'border-blue-500 bg-blue-500/10 shadow-[0_20px_40px_rgba(59,130,246,0.2)] scale-[1.03]' : 'border-white/5 hover:border-blue-500/30 hover:bg-white/5'}`}
            >
              <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${item.id === currentId ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`} 
                  onError={(e) => (e.currentTarget.src = 'https://images.pollinations.ai/prompt/abstract%20digital%20glitch%20blue%20dark?nologo=true')}
                />
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 transform translate-y-[-10px] group-hover:translate-y-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-3 glass bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-2xl backdrop-blur-2xl"
                    title="Purge Node"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-3 glass border-white/20 rounded-2xl hover:scale-110 transition-all shadow-2xl backdrop-blur-2xl ${item.isFavorite ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' : 'text-white bg-white/10 hover:bg-white/20'}`}
                    title={item.isFavorite ? "Unpin Node" : "Pin Node"}
                  >
                    <svg className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {item.isUpscaled && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="text-[8px] font-black bg-purple-600/90 text-white px-2.5 py-1 rounded-lg shadow-2xl backdrop-blur-md border border-purple-400/30 tracking-widest uppercase">
                      4K MASTER
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
              </div>
              <div className="p-5 bg-black/40 backdrop-blur-xl">
                <p className="text-[12px] text-gray-200 line-clamp-1 italic mb-3 font-semibold tracking-tight leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  "{item.prompt}"
                </p>
                <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.id === currentId ? 'bg-blue-400 animate-pulse' : 'bg-blue-500/20'} shadow-[0_0_10px_rgba(59,130,246,0.3)]`}></div>
                    {item.width}PX
                  </span>
                  <span className="opacity-40">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
      {isOpen && <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-80 glass-dark z-50 transition-all duration-700 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col border-r border-white/10 shadow-[40px_0_100px_rgba(0,0,0,0.9)]`}>
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[20px] bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-inner group overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-500/5 shimmer"></div>
                <svg className="w-6 h-6 text-blue-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-black text-blue-500/40 uppercase tracking-[0.4em] mb-1">Neural ID</h4>
                <p className="text-[14px] font-black text-white uppercase tracking-tighter truncate leading-none">{currentUser}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-3.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all" title="Terminate Session">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search synthesis log..." 
              className="w-full bg-black/60 border border-white/10 rounded-[20px] py-4.5 px-6 text-[13px] text-white outline-none focus:border-blue-500/40 focus:ring-8 focus:ring-blue-500/5 transition-all placeholder:text-gray-600 font-medium" 
            />
            <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-700 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-10">
              <div className="w-full aspect-square rounded-[48px] glass border border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group">
                 <img 
                   src="https://images.pollinations.ai/prompt/abstract%20digital%20neural%20network%20nebula%20dark%20blue?width=512&height=512&nologo=true" 
                   className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-1000" 
                   alt="Neural Placeholder"
                 />
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-2xl animate-bounce-slow">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                    </div>
                    <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40">Archive Offline</h4>
                 </div>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600 leading-relaxed max-w-[200px] mx-auto opacity-60">
                Awaiting neural signal. Your visual history will manifest here.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
              <p className="text-[12px] font-black uppercase tracking-widest text-white">No nodes found</p>
              <button onClick={() => setSearchQuery('')} className="text-[11px] text-blue-500 font-black mt-6 uppercase underline underline-offset-[12px] hover:text-blue-400 transition-colors">Clear Filter</button>
            </div>
          ) : (
            <>
              {renderSection("Pinned", groupedHistory.pinned, <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>)}
              {renderSection("Neural Archive", groupedHistory.recent)}
              <AdSlot type="sidebar" className="mt-12" />
            </>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-black/80 space-y-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Neural Sync</span>
              <span className={`text-[12px] font-black font-mono ${credits === 0 ? 'text-red-500' : 'text-blue-500'}`}>{credits} / 8</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
              <div className={`h-full transition-all duration-1000 ease-out rounded-full ${credits === 0 ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-gradient-to-r from-blue-700 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`} style={{ width: `${(credits / 8) * 100}%` }}></div>
            </div>
            <button onClick={onRefillCredits} className="w-full py-4.5 glass-dark border border-white/10 rounded-[20px] text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all active:scale-[0.97] shadow-2xl">Re-establish Sync</button>
          </div>
          <div className="flex items-center justify-between pt-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-800">BAMANIA OS v2.5</span>
            <button onClick={onClear} className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900/40 hover:text-red-500 transition-colors">Purge Data</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
