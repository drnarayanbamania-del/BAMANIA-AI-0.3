
import React, { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
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
  focusInput: () => void;
}

const MAX_SEED = 2147483647;
const MIN_SEED = 0;

const InputBar = forwardRef<InputBarHandle, InputBarProps>(({ onGenerate, onEnhance, isLoading, credits, currentUser }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('1024x1024');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
    },
    focusInput: () => {
      inputRef.current?.focus();
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
    <div className="fixed bottom-10 left-1/2 lg:left-[calc(50%+160px)] -translate-x-1/2 w-full max-w-5xl px-6 z-50 animate-in slide-in-from-bottom-12 duration-1000">
      
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
          className={`glass p-3 rounded-[32px] flex flex-wrap md:flex-nowrap items-center gap-3 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl transition-all duration-700 ${isEnhancing ? 'ring-2 ring-purple-500/40 shadow-purple-500/10' : ''} ${isOutOfCredits ? 'border-red-500/30' : ''}`}
        >
          {/* 1. MAGIC ENHANCE BUTTON - LEFT */}
          <div className="flex items-center gap-2 pl-1">
            <button
              type="button"
              onClick={handleEnhance}
              title="Magic Enhance"
              disabled={!prompt.trim() || isEnhancing || isLoading || isOutOfCredits}
              className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 disabled:opacity-30 group relative border ${
                isEnhancing 
                ? 'bg-purple-600/30 text-purple-100 border-purple-500/50 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white hover:scale-105 active:scale-90'
              }`}
            >
              {isEnhancing ? (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={handleSavePrompt}
              title="Save to Bank"
              disabled={!prompt.trim() || isOutOfCredits}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white hover:bg-white/10 hover:border-white/10 transition-all hover:scale-105 active:scale-90 disabled:opacity-30"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* 2. PROMPT INPUT */}
          <div className="flex-1 min-w-[200px] relative">
            <input 
              ref={inputRef}
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isOutOfCredits ? "NEURAL CREDITS EXHAUSTED" : "Describe your neural vision..."}
              disabled={isLoading || isEnhancing || isOutOfCredits}
              className="w-full bg-transparent border-none text-white text-base py-3 px-2 outline-none placeholder:text-gray-600 font-medium"
            />
          </div>

          {/* 3. SETTINGS & ACTIONS */}
          <div className="flex items-center gap-3">
             {/* Seed Input (Desktop) */}
             <div className="hidden lg:flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-2xl">
               <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Seed</span>
               <input 
                type="text" 
                value={seed}
                onChange={handleSeedChange}
                placeholder="Random"
                className="w-20 bg-transparent border-none text-[11px] text-blue-500 font-black outline-none placeholder:text-gray-800"
               />
             </div>

             {/* Resolution Selector */}
             <div className="relative group/res">
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                  className="bg-black/40 border border-white/5 px-4 py-3 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none appearance-none hover:border-white/20 transition-all cursor-pointer"
                >
                  <option value="512x512">512px</option>
                  <option value="1024x1024">1024px</option>
                  <option value="1536x1536">1536px</option>
                  <option value="2048x2048">2048px</option>
                </select>
             </div>

             {/* Library Toggle */}
             <button
              type="button"
              onClick={() => setShowLibrary(!showLibrary)}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white hover:bg-white/10 transition-all"
             >
               <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
             </button>

             {/* Generate Button */}
             <button 
              type="submit"
              disabled={!prompt.trim() || isLoading || isEnhancing || isOutOfCredits}
              className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 shadow-2xl disabled:opacity-30 disabled:grayscale ${isOutOfCredits ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'}`}
             >
               {isLoading ? 'Synthesizing...' : 'Generate'}
               {!isLoading && (
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               )}
             </button>
          </div>
        </form>
        
        <div className="flex justify-center gap-6">
           <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Bamania Synthesis Cluster — Phase 4</p>
        </div>
      </div>
    </div>
  );
});

export default InputBar;
