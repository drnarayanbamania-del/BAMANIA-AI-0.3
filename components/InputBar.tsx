
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Resolution } from '../types';

interface InputBarProps {
  onGenerate: (prompt: string, seed: number | undefined, resolution: Resolution) => void;
  onEnhance: (currentPrompt: string) => Promise<string>;
  isLoading: boolean;
  credits: number;
}

export interface InputBarHandle {
  setPromptAndSeed: (prompt: string, seed: number) => void;
}

const MAX_SEED = 2147483647;
const MIN_SEED = 0;

const RESOLUTIONS: Resolution[] = ['512x512', '1024x1024', '1536x1536'];

const InputBar = forwardRef<InputBarHandle, InputBarProps>(({ onGenerate, onEnhance, isLoading, credits }, ref) => {
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<string>('');
  const [resolution, setResolution] = useState<Resolution>('1024x1024');
  const [isEnhancing, setIsEnhancing] = useState(false);

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

  const isOutOfCredits = credits <= 0;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50 animate-in slide-in-from-bottom-8 duration-700">
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
