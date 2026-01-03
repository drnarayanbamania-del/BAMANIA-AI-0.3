
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
}

const MAX_SEED = 2147483647;
const MIN_SEED = 0;

const RESOLUTIONS: Resolution[] = ['512x512', '1024x1024', '1536x1536'];

const InputBar = forwardRef<InputBarHandle, InputBarProps>(({ onGenerate, onEnhance, isLoading, credits, currentUser }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('1024x1024');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  // Load saved prompts on mount or user change
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
    
    // Minimalistic visual confirmation could be handled by a toast in App.tsx 
    // but here we just toggle library to show it's there or just close any open ones.
    setShowLibrary(true);
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50 animate-in slide-in-from-bottom-8 duration-700">
      
      {/* Saved Prompts Library Popover */}
      {showLibrary && (
        <div className="absolute bottom-full left-0 right-0 mb-4 px-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="glass max-h-64 overflow-y-auto rounded-3xl p-4 shadow-2xl border border-white/10 custom-scrollbar">
            <div className="flex justify-between items-center mb-4 px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Neural Archives</h4>
              <button onClick={() => setShowLibrary(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {savedPrompts.length === 0 ? (
              <p className="text-[10px] text-gray-600 uppercase text-center py-8 font-bold tracking-widest">Archive Empty</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {savedPrompts.map((saved) => (
                  <div 
                    key={saved.id} 
                    onClick={() => handleLoadSaved(saved)}
                    className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate italic">"{saved.prompt}"</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[8px] font-black text-gray-500 uppercase">{saved.resolution}</span>
                        {saved.seed && <span className="text-[8px] font-black text-blue-500/50 uppercase">SEED: {saved.seed}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSaved(saved.id, e)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <form 
          onSubmit={handleSubmit}
          className={`glass p-2 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-500 ${isEnhancing ? 'ring-2 ring-purple-500/50' : ''} ${isOutOfCredits ? 'border-red-500/20' : ''}`}
        >
          {/* Prompt Input Area */}
          <div className={`flex-1 min-w-[200px] px-4 py-2 border-r border-white/10 relative overflow-hidden group`}>
            {isEnhancing && <div className="absolute inset-0 shimmer opacity-30 z-0"></div>}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isOutOfCredits ? "Exhausted credits. Refill required..." : (isEnhancing ? "Gemini is dreaming..." : "Visualize something incredible...")}
              className={`w-full bg-transparent border-none outline-none placeholder-gray-500 text-lg relative z-10 disabled:opacity-50 ${isOutOfCredits ? 'text-red-400' : 'text-white'}`}
              disabled={isLoading || isEnhancing || isOutOfCredits}
            />
          </div>

          {/* Resolution Selector */}
          <div className="px-4 py-2 border-r border-white/10 hidden lg:flex items-center gap-2">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as Resolution)}
              className="bg-transparent border-none outline-none text-gray-400 text-sm font-bold cursor-pointer hover:text-white transition-colors"
              disabled={isLoading || isEnhancing || isOutOfCredits}
            >
              {RESOLUTIONS.map(res => (
                <option key={res} value={res} className="bg-[#030712]">{res}</option>
              ))}
            </select>
          </div>

          {/* Seed Input */}
          <div className="w-28 px-2 py-2 border-r border-white/10 hidden md:block">
            <input
              type="number"
              value={seed}
              onChange={handleSeedChange}
              placeholder="Seed"
              min={MIN_SEED}
              max={MAX_SEED}
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isLoading || isEnhancing || isOutOfCredits}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pr-1 ml-auto">
            <button
              type="button"
              onClick={handleEnhance}
              title="Magic Enhance"
              disabled={!prompt.trim() || isEnhancing || isLoading || isOutOfCredits}
              className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 disabled:opacity-50 group relative shadow-inner overflow-hidden ${
                isEnhancing 
                ? 'bg-purple-500/30 text-purple-100 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-white/5 hover:bg-white/10 text-white hover:scale-110'
              }`}
            >
              {isEnhancing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleSavePrompt}
              title="Save Prompt to Library"
              disabled={!prompt.trim() || isLoading || isEnhancing}
              className="flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:scale-110 transition-all group"
            >
              <svg className="w-5 h-5 text-blue-400 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowLibrary(!showLibrary)}
              title="Prompt Library"
              className={`flex items-center justify-center p-3 rounded-xl transition-all group ${showLibrary ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading || isEnhancing || isOutOfCredits}
              className={`px-8 py-3 rounded-xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)] border ${isOutOfCredits ? 'bg-red-600/20 text-red-500 border-red-500/40' : 'bg-white text-black border-white'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="uppercase tracking-tighter">{isOutOfCredits ? 'Low Energy' : 'Generate'}</span>
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
