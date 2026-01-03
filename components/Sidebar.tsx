
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';

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
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const groupedHistory = useMemo(() => {
    const filtered = history.filter(item => 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const favorites = filtered.filter(item => item.isFavorite);
    const others = filtered.filter(item => !item.isFavorite).sort((a, b) => b.timestamp - a.timestamp);
    const now = new Date();
    const isToday = (ts: number) => new Date(ts).toDateString() === now.toDateString();
    
    const today = others.filter(item => isToday(item.timestamp));
    const archived = others.filter(item => !isToday(item.timestamp));

    return { favorites, today, archived };
  }, [history, searchQuery]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const renderSection = (title: string, items: HistoryItem[], icon?: React.ReactNode) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          {icon}
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{title} — {items.length}</h3>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="space-y-4">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => isSelectMode ? toggleSelect(item.id, { stopPropagation: () => {} } as any) : onSelect(item)}
                className={`group relative cursor-pointer glass rounded-2xl overflow-hidden transition-all duration-500 ${item.id === currentId ? 'border-blue-500/50' : isSelected ? 'border-blue-500' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="relative aspect-video">
                  <img src={item.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  {isSelectMode && <div className={`absolute inset-0 flex items-center justify-center ${isSelected ? 'bg-blue-600/20' : 'bg-black/20'}`}><div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-white' : 'border-white/40'}`}></div></div>}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.isUpscaled && <span className="text-[7px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded">4K</span>}
                  </div>
                </div>
                <div className="p-3 bg-white/5">
                  <p className="text-[10px] text-gray-400 line-clamp-1 italic mb-1">"{item.prompt}"</p>
                  <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                    <span>{item.width}x{item.height}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-80 glass-dark z-50 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col border-r border-white/5`}>
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Profile</h4>
                <p className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[120px]">{currentUser}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-[9px] font-black text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors">Term Link</button>
          </div>
          <div className="relative group">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search archives..." className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-blue-500/30 transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Void Database</h4>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-gray-500 leading-relaxed">No neural patterns recorded for this identity.</p>
            </div>
          ) : (
            <>
              {renderSection("Pinned", groupedHistory.favorites, <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>)}
              {renderSection("Today", groupedHistory.today)}
              {renderSection("Older Nodes", groupedHistory.archived)}
            </>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Neural Credits</span>
              <span className={`text-[10px] font-black font-mono ${credits === 0 ? 'text-red-500' : 'text-blue-500'}`}>{credits} / 8</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-700 ${credits === 0 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(credits / 8) * 100}%` }}></div>
            </div>
            <button onClick={onRefillCredits} className="w-full py-2.5 glass border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all">Refill Link</button>
          </div>
          <div className="flex items-center justify-between opacity-30 pt-2">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Secure Protocol v2.5</span>
            <button onClick={onClear} className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:opacity-100 transition-opacity">Flush DB</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
