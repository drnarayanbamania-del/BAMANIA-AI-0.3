
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onSelect: (item: HistoryItem) => void;
  onClose: () => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, isOpen, onSelect, onClose, onClear, onDeleteItem }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => 
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history, searchQuery]);

  const copyPrompt = (e: React.MouseEvent, prompt: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-full w-80 glass-dark z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               <h2 className="text-xl font-bold tracking-tight text-white">Gallery</h2>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={onClear}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-white/10 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 text-center px-6">
              <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm">Your visual creations will appear here.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50 text-center px-6 mt-10">
              <svg className="w-10 h-10 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-sm">No matches found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="group relative cursor-pointer glass rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <img src={item.imageUrl} alt={item.prompt} className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => copyPrompt(e, item.prompt)}
                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-all border border-white/10"
                    title="Copy Prompt"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                    className="p-1.5 bg-red-500/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 transition-all border border-red-500/10"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="p-3">
                  <p className="text-xs text-gray-300 line-clamp-2 italic mb-1">"{item.prompt}"</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Seed: {item.seed}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
