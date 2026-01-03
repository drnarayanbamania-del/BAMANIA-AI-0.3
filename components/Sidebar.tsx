
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/50">{title} — {items.length}</h3>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group relative cursor-pointer glass rounded-[28px] overflow-hidden transition-all duration-500 border-2 ${item.id === currentId ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className="relative aspect-square bg-gray-900 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  onError={(e) => (e.currentTarget.src = 'https://images.pollinations.ai/prompt/abstract%20digital%20glitch%20blue%20dark?nologo=true')}
                />
                
                {/* Individual Action Layer */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-2.5 glass bg-red-500/20 border-red-500/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl backdrop-blur-md"
                    title="Purge Node"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-2.5 glass border-white/20 rounded-xl hover:scale-110 transition-all shadow-xl backdrop-blur-md ${item.isFavorite ? 'text-pink-500 bg-pink-500/20 border-pink-500/30' : 'text-white bg-white/10 hover:bg-white/30'}`}
                    title={item.isFavorite ? "Unpin Node" : "Pin Node"}
                  >
                    <svg className="w-3.5 h-3.5" fill={item.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* Badge Overlay */}
                {item.isUpscaled && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="text-[7px] font-black bg-purple-600/80 text-white px-2 py-0.5 rounded-md shadow-lg backdrop-blur-md border border-purple-400/30">
                      4K MASTER
                    </span>
                  </div>
                )}
                
                {/* Subtle Bottom Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              </div>
              <div className="p-4 bg-black/40 backdrop-blur-md">
                <p className="text-[11px] text-gray-200 line-clamp-1 italic mb-2 font-medium tracking-tight">
                  "{item.prompt}"
                </p>
                <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.id === currentId ? 'bg-blue-400 animate-pulse' : 'bg-blue-500/30'} shadow-[0_0_8px_rgba(59,130,246,0.5)]`}></div>
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
      {isOpen && <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-80 glass-dark z-50 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.8)]`}>
        <div className="p-7 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.3em] mb-0.5">Neural Identity</h4>
                <p className="text-sm font-black text-white uppercase tracking-tighter truncate leading-none">{currentUser}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all" title="Terminate Session">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search synthesis log..." 
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-600 font-medium" 
            />
            <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-full aspect-square rounded-[40px] glass border border-dashed border-white/10 mb-8 flex items-center justify-center relative overflow-hidden group">
                 <img 
                   src="https://images.pollinations.ai/prompt/abstract%20digital%20neural%20network%20nebula%20dark%20blue?width=512&height=512&nologo=true" 
                   className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-1000" 
                   alt="Neural Placeholder"
                 />
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-2xl animate-bounce-slow">
                      <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Archive Empty</h4>
                 </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 leading-relaxed max-w-[200px] mx-auto">
                No synthesis patterns detected. Start generating to fill your gallery.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
              <p className="text-[11px] font-black uppercase tracking-widest text-white">No nodes found</p>
              <button onClick={() => setSearchQuery('')} className="text-[10px] text-blue-500 font-black mt-4 uppercase underline underline-offset-8 hover:text-blue-400 transition-colors">Clear Filter</button>
            </div>
          ) : (
            <>
              {renderSection("Pinned", groupedHistory.pinned, <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>)}
              {renderSection("Neural Feed", groupedHistory.recent)}
              <AdSlot type="sidebar" className="mt-8" />
            </>
          )}
        </div>

        <div className="p-7 border-t border-white/5 bg-black/60 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural Credits</span>
              <span className={`text-[11px] font-black font-mono ${credits === 0 ? 'text-red-500' : 'text-blue-500'}`}>{credits} / 8</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
              <div className={`h-full transition-all duration-1000 ease-out rounded-full ${credits === 0 ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]' : 'bg-gradient-to-r from-blue-700 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'}`} style={{ width: `${(credits / 8) * 100}%` }}></div>
            </div>
            <button onClick={onRefillCredits} className="w-full py-4 glass-dark border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all active:scale-95 shadow-xl">Re-establish Sync</button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-800">BAMANIA OS v2.5</span>
            <button onClick={onClear} className="text-[9px] font-black uppercase tracking-widest text-red-900/40 hover:text-red-500 transition-colors">Wipe All</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
