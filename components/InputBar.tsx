
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Resolution, SavedPrompt } from '../types';

interface InputBarProps {
  onGenerate: (prompt: string, seed: number | undefined, resolution: Resolution) => void;
  onEnhance: (currentPrompt: string) => Promise<string>;
  isLoading: boolean;
  credits: number;
  currentUser: string;
}

export interface InputBarHandle {
  setPromptAndSeed: (prompt: string, seed: number) => void;
  clearPrompt: () => void;
}

const MAX_SEED = 2147483647;
const MIN_SEED = 0;

const RESOLUTIONS: Resolution[] = ['512x512', '1024x1024', '1536x1536', '2048x2048'];

const InputBar = forwardRef<InputBarHandle, InputBarProps>(({ onGenerate, onEnhance, isLoading, credits, currentUser }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('1024x1024');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`bamania_saved_${currentUser}`);
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prompts");
      }
    }
  }, [currentUser]);

  useImperativeHandle(ref, () => ({
    setPromptAndSeed: (p: string, s: number) => {
      setPrompt(p);
      setSeed(s.toString());
    },
    clearPrompt: () => {
      setPrompt('');
      setSeed('');
    }
  }));

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setSeed('');
      return;
    }
    const numericVal = parseInt(val, 10);
    if (!isNaN(numericVal)) {
      const clampedVal = Math.max(MIN_SEED, Math.min(MAX_SEED, numericVal));
      setSeed(clampedVal.toString());
    }
  };

  const handleRandomSeed = () => {
    const randomVal = Math.floor(Math.random() * (MAX_SEED + 1));
    setSeed(randomVal.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !isEnhancing && credits > 0) {
      const seedNum = seed.trim() !== '' ? parseInt(seed, 10) : undefined;
      onGenerate(prompt, seedNum, resolution);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing || isLoading) return;
    setIsEnhancing(true);
    const enhanced = await onEnhance(prompt);
    setPrompt(enhanced);
    setIsEnhancing(false);
  };

  const handleSavePrompt = () => {
    if (!prompt.trim()) return;
    
    const newSaved: SavedPrompt = {
      id: crypto.randomUUID(),
      prompt,
      seed,
      resolution,
      timestamp: Date.now()
    };

    const updated = [newSaved, ...savedPrompts];
    setSavedPrompts(updated);
    localStorage.setItem(`bamania_saved_${currentUser}`, JSON.stringify(updated));
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem(`bamania_saved_${currentUser}`, JSON.stringify(updated));
  };

  const handleLoadSaved = (saved: SavedPrompt) => {
    setPrompt(saved.prompt);
    setSeed(saved.seed);
    setResolution(saved.resolution);
    setShowLibrary(false);
  };

  const isOutOfCredits = credits <= 0;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-50 animate-in slide-in-from-bottom-12 duration-1000">
      
      {/* Saved Prompts Library Popover */}
      {showLibrary && (
        <div className="absolute bottom-full left-0 right-0 mb-6 px-6 animate-in slide-in-from-bottom-6 fade-in duration-500">
          <div className="glass max-h-72 overflow-y-auto rounded-[32px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 custom-scrollbar backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-5 px-2">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">Neural Seed Bank</h4>
              <button onClick={() => setShowLibrary(false)} className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {savedPrompts.length === 0 ? (
              <div className="py-12 text-center opacity-30">
                <svg className="w-10 h-10 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">Bank Empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {savedPrompts.map((saved) => (
                  <div 
                    key={saved.id} 
                    onClick={() => handleLoadSaved(saved)}
                    className="group flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-white font-medium truncate italic opacity-80 group-hover:opacity-100 transition-opacity">"{saved.prompt}"</p>
                      <div className="flex gap-4 mt-1.5">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{saved.resolution}</span>
                        {saved.seed && <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">SEED: {saved.seed}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSaved(saved.id, e)}
                      className="p-2.5 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <form 
          onSubmit={handleSubmit}
          className={`glass p-2 rounded-[32px] flex flex-wrap md:flex-nowrap items-center gap-2 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl transition-all duration-700 ${isEnhancing ? 'ring-2 ring-purple-500/40 shadow-purple-500/10' : ''} ${isOutOfCredits ? 'border-red-500/30' : 'focus-within:border-blue-500/30'}`}
        >
          {/* Resolution Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowResMenu(!showResMenu)}
              className="px-5 py-4 glass border border-white/5 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
            >
              {resolution}
              <svg className={`w-3 h-3 transition-transform ${showResMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showResMenu && (
              <div className="absolute bottom-full left-0 mb-3 glass rounded-2xl border border-white/10 shadow-2xl p-2 min-w-[140px] animate-in slide-in-from-bottom-2 fade-in">
                {RESOLUTIONS.map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => { setResolution(res); setShowResMenu(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resolution === res ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div className="flex-1 min-w-[200px] px-6 py-2 relative overflow-hidden group">
            {isEnhancing && <div className="absolute inset-0 shimmer opacity-20 z-0"></div>}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isOutOfCredits ? "Daily credits depleted. Link required..." : (isEnhancing ? "Gemini is dreaming up patterns..." : "Type your visual imagination...")}
              className={`w-full bg-transparent border-none outline-none placeholder-gray-600 text-[17px] font-medium relative z-10 disabled:opacity-50 tracking-tight ${isOutOfCredits ? 'text-red-400' : 'text-white'}`}
              disabled={isLoading || isEnhancing || isOutOfCredits}
            />
          </div>

          {/* Advanced Seed Controls */}
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border border-white/5 bg-black/20">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Seed Control</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={handleSeedChange}
                  placeholder="AUTO"
                  min={MIN_SEED}
                  max={MAX_SEED}
                  className="w-20 bg-transparent border-none outline-none text-white placeholder-gray-700 text-[12px] font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:text-blue-400 transition-colors"
                  disabled={isLoading || isEnhancing || isOutOfCredits}
                />
                <button
                  type="button"
                  onClick={handleRandomSeed}
                  disabled={isLoading || isEnhancing || isOutOfCredits}
                  title="Randomize Seed"
                  className="p-1.5 glass rounded-lg border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:rotate-180 duration-500"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pr-1 ml-auto">
            <button
              type="button"
              onClick={handleEnhance}
              title="Magic Enhance with Gemini"
              disabled={!prompt.trim() || isEnhancing || isLoading || isOutOfCredits}
              className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 disabled:opacity-30 group relative border ${
                isEnhancing 
                ? 'bg-purple-600/30 text-purple-100 border-purple-500/50 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white active:scale-90'
              }`}
            >
              {isEnhancing ? (
                <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleSavePrompt}
              title="Save to Library"
              disabled={!prompt.trim() || isLoading || isEnhancing}
              className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white hover:scale-105 active:scale-90 transition-all group"
            >
              <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowLibrary(!showLibrary)}
              title="Open Library"
              className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 group border ${showLibrary ? 'bg-blue-600/30 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white active:scale-90'}`}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading || isEnhancing || isOutOfCredits}
              className={`px-8 py-4 rounded-2xl font-black text-[13px] hover:scale-105 active:scale-[0.94] transition-all duration-500 disabled:opacity-30 disabled:scale-100 flex items-center gap-3 shadow-2xl border ${isOutOfCredits ? 'bg-red-600/20 text-red-500 border-red-500/40' : 'bg-blue-600 text-white border-blue-500'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  <span className="uppercase tracking-[0.1em]">{isOutOfCredits ? 'Link Lost' : 'Generate Image'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default InputBar;
