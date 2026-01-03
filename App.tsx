
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import InputBar, { InputBarHandle } from './components/InputBar';
import AdSlot from './components/AdSlot';
import { HistoryItem, ViewState, Resolution } from './types';
import { enhancePrompt, isApiKeyConfigured } from './services/geminiService';

const SparkleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const BoltIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const HomeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338-11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.894 4.44-9.897 9.887-.001 2.155.593 4.256 1.72 6.038l-1.102 4.025 4.149-1.087zm11.646-7.391c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.3-.775.979-.95 1.179-.175.199-.349.225-.65.075-.301-.15-1.27-.467-2.42-1.493-.894-.797-1.496-1.782-1.672-2.081-.175-.3-.019-.462.131-.611.135-.134.301-.351.45-.525.15-.175.199-.3.3-.5.1-.199.05-.374-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.009-.374-.01-.574-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.925 1.225 3.125c.15.199 2.113 3.227 5.118 4.524.714.309 1.273.493 1.708.632.717.228 1.369.196 1.885.119.574-.085 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.226-.575-.376z"/>
  </svg>
);

const MAX_DAILY_CREDITS = 8;
const MAX_HISTORY_LIMIT = 50;

const LOADING_STEPS = [
  "Mapping Neural Pathways...",
  "Querying Gemini Engine...",
  "Synthesizing High-Detail Fragments...",
  "Applying Chromatic Aberration...",
  "Optimizing Visual Spectral Density...",
  "Exporting Neural Construct...",
];

const UPSCALE_STEPS = [
  "Interpolating Spatial Data...",
  "Reconstructing Edge Integrity...",
  "Enhancing Texture Resolution...",
  "Finalizing Ultra-HD Master...",
];

const VARIATION_STEPS = [
  "Sampling Latent Dimensions...",
  "Branching Visual Pathways...",
  "Synthesizing Pattern Swarm...",
  "Polishing Visual Iterations...",
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const SkeletonLoader: React.FC<{ progress: number, stepText: string }> = ({ progress, stepText }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-3xl overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_25px_rgba(59,130,246,0.9)] animate-[scanline_1.5s_linear_infinite] z-30"></div>
    <div className="relative flex flex-col items-center max-w-sm w-full px-10">
      <div className="w-64 h-64 mb-16 flex items-center justify-center relative">
        <div className="absolute inset-0 border-[4px] border-blue-500/10 rounded-full animate-ping duration-[3s]"></div>
        <div className="absolute inset-2 border-[2px] border-blue-500/20 rounded-full animate-pulse duration-[2s]"></div>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="128" cy="128" r="120" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
          <circle cx="128" cy="128" r="120" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={754} strokeDashoffset={754 - (754 * progress) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </svg>
        <div className="relative z-10 bg-blue-500/5 p-8 rounded-full border border-blue-500/20 backdrop-blur-xl group">
          <SparkleIcon className="w-16 h-16 text-blue-500 animate-pulse" />
        </div>
      </div>
      <div className="w-full space-y-8 text-center">
        <div className="flex justify-between items-end mb-2 px-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">{Math.round(progress)}% COMPLETE</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">SYNTHESIS_ACTIVE</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5 backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="relative h-12 flex items-center justify-center">
          <p className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em] animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{stepText}</p>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('landing');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [credits, setCredits] = useState<number>(MAX_DAILY_CREDITS);
  const [currentImage, setCurrentImage] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isVariationsLoading, setIsVariationsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUpscaleConfirm, setShowUpscaleConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputBarRef = useRef<InputBarHandle>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      const storageKey = `bamania_history_${currentUser}`;
      const creditKey = `bamania_credits_${currentUser}`;
      const refreshKey = `bamania_last_refresh_${currentUser}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
            if (parsed.length > 0) setCurrentImage(parsed[0]);
          }
        }
      } catch (e) { console.error("Archive sync error."); }
      const today = new Date().toISOString().split('T')[0];
      const lastRefresh = localStorage.getItem(refreshKey);
      const savedCredits = localStorage.getItem(creditKey);
      if (lastRefresh !== today) {
        setCredits(MAX_DAILY_CREDITS);
        localStorage.setItem(refreshKey, today);
        localStorage.setItem(creditKey, MAX_DAILY_CREDITS.toString());
      } else if (savedCredits !== null) {
        setCredits(parseInt(savedCredits, 10));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const limitedHistory = history.slice(0, MAX_HISTORY_LIMIT);
      localStorage.setItem(`bamania_history_${currentUser}`, JSON.stringify(limitedHistory));
      localStorage.setItem(`bamania_credits_${currentUser}`, credits.toString());
    }
  }, [history, credits, currentUser]);

  useEffect(() => {
    let stepInterval: number;
    let progressInterval: number;
    const activeLoading = isLoading || isVariationsLoading || isUpscaling;
    const steps = isUpscaling ? UPSCALE_STEPS : (isVariationsLoading ? VARIATION_STEPS : LOADING_STEPS);
    if (activeLoading) {
      setLoadingStep(0);
      setLoadingProgress(2);
      stepInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
      }, 1200);
      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 98) return 98;
          const remaining = 100 - prev;
          const increment = (remaining * 0.05) + (Math.random() * 0.5);
          return Math.min(98.5, prev + increment);
        });
      }, 200);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, isVariationsLoading, isUpscaling]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleLogin = (id: string) => {
    setCurrentUser(id);
    setView('app');
    showToast(`Neural Link Established.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistory([]);
    setCurrentImage(null);
    setView('landing');
  };

  const handleRefillCredits = () => {
    setCredits(MAX_DAILY_CREDITS);
    showToast(`Neural Credits Restored.`);
  };

  const handleGenerateNew = () => {
    setCurrentImage(null);
    inputBarRef.current?.clearPrompt();
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGenerate = useCallback(async (prompt: string, userSeed: number | undefined, resolution: Resolution) => {
    if (credits <= 0) {
      showToast("Identity credits exhausted.", "error");
      return;
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showToast("Neural link failure: API Key missing.", "error");
      return;
    }
    const startTime = performance.now();
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      let base64Image = '';
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            base64Image = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      if (base64Image) {
        const endTime = performance.now();
        const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(1));
        const [width, height] = resolution.split('x').map(Number);
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          prompt,
          imageUrl: base64Image,
          seed: userSeed || Math.floor(Math.random() * 999999),
          timestamp: Date.now(),
          width,
          height,
          generationTime,
          isFavorite: false
        };
        setHistory(prev => [newItem, ...prev]);
        setCurrentImage(newItem);
        setCredits(prev => Math.max(0, prev - 1));
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 500);
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error("Neural output empty.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      showToast("Synthesis Protocol Failed.", "error");
    }
  }, [credits]);

  const executeRegenerate = () => {
    if (!currentImage || isLoading || credits <= 0) return;
    handleGenerate(currentImage.prompt, undefined, '1024x1024');
  };

  const executeUpscale = async () => {
    if (!currentImage || isUpscaling || credits <= 0) return;
    setShowUpscaleConfirm(false);
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    setIsUpscaling(true);
    showToast("Initializing 4K Master...", "info");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Ultra high-res 4k masterpiece, hyper-realistic: ${currentImage.prompt}` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      let base64Image = '';
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            base64Image = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      if (base64Image) {
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          prompt: currentImage.prompt,
          imageUrl: base64Image,
          seed: currentImage.seed,
          timestamp: Date.now(),
          width: 2048,
          height: 2048,
          isUpscaled: true,
          generationTime: 1.8,
          isFavorite: currentImage.isFavorite
        };
        setHistory(prev => [newItem, ...prev]);
        setCurrentImage(newItem);
        setCredits(prev => Math.max(0, prev - 1));
        setLoadingProgress(100);
        showToast("4K Mastery Achieved.");
        setTimeout(() => setIsUpscaling(false), 500);
      }
    } catch (error) {
      setIsUpscaling(false);
      showToast("4K Link Failure.", "error");
    }
  };

  const handleCreateVariations = async () => {
    if (credits <= 0 || !currentImage || isVariationsLoading) return;
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;
    setIsVariationsLoading(true);
    showToast("Deploying Variant Swarm...", "info");
    try {
      const ai = new GoogleGenAI({ apiKey });
      const swarmPromises = [1, 2, 3, 4].map(async () => {
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `Creative variation of: ${currentImage.prompt}. Masterpiece.` }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });
        const candidate = resp.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        return null;
      });
      const results = await Promise.all(swarmPromises);
      const validResults: HistoryItem[] = results
        .filter((url): url is string => url !== null)
        .map((url, i) => ({
          id: crypto.randomUUID(),
          prompt: currentImage.prompt,
          imageUrl: url,
          seed: Math.floor(Math.random() * 999999),
          timestamp: Date.now() + i,
          width: 1024,
          height: 1024,
          generationTime: 1.5,
          isFavorite: false
        }));
      if (validResults.length > 0) {
        setHistory(prev => [...validResults, ...prev]);
        setCurrentImage(validResults[0]);
        setCredits(prev => Math.max(0, prev - 1));
        showToast(`Swarm Sync Complete.`);
      }
      setLoadingProgress(100);
      setTimeout(() => setIsVariationsLoading(false), 600);
    } catch (error) {
      setIsVariationsLoading(false);
      showToast("Swarm Protocol Failed.", "error");
    }
  };

  const handleDeleteItem = (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    setHistory(prev => prev.filter(item => !idList.includes(item.id)));
    if (currentImage && idList.includes(currentImage.id)) setCurrentImage(null);
  };

  if (view === 'landing' || !currentUser) {
    return <LandingPage onEnter={handleLogin} />;
  }

  const currentLoadingStepText = isUpscaling ? UPSCALE_STEPS[loadingStep] : (isVariationsLoading ? VARIATION_STEPS[loadingStep] : LOADING_STEPS[loadingStep]);

  return (
    <div className="flex min-h-screen bg-[#030712] overflow-hidden text-slate-200">
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto glass px-6 py-4 rounded-3xl flex items-center gap-3 shadow-3xl animate-in slide-in-from-top-6 fade-in duration-500 border-white/20">
            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/40' : 'bg-blue-500 shadow-blue-500/40'}`}></div>
            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{toast.message}</span>
          </div>
        ))}
      </div>

      <Sidebar 
        history={history}
        credits={credits}
        isOpen={isSidebarOpen}
        onSelect={(item) => {
          setCurrentImage(item);
          setIsSidebarOpen(false);
          if (inputBarRef.current) inputBarRef.current.setPromptAndSeed(item.prompt, item.seed);
          mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClose={() => setIsSidebarOpen(false)}
        onClear={() => setShowClearConfirm(true)}
        onDeleteItem={handleDeleteItem}
        onToggleFavorite={(id) => {
          setHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
          if (currentImage?.id === id) setCurrentImage(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        }}
        onRefillCredits={handleRefillCredits}
        onLogout={handleLogout}
        currentUser={currentUser}
        currentId={currentImage?.id}
      />

      <main ref={mainScrollRef} className="flex-1 relative flex flex-col items-center justify-start p-6 lg:ml-80 transition-all overflow-y-auto custom-scrollbar scroll-smooth">
        <header className="w-full max-w-5xl pt-10 pb-16 flex flex-col items-center text-center relative z-30">
          <div className="flex items-center gap-6 mb-6 w-full justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex items-center gap-4 whitespace-nowrap group">
                <SparkleIcon className="text-blue-500 logo-glow w-12 h-12 shrink-0 group-hover:scale-110 transition-transform duration-500" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter logo-gradient uppercase text-white">BAMANIA AI</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleGenerateNew} className={`p-4 glass rounded-[24px] border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group flex items-center gap-3 ${(!currentImage && !isLoading) ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={!currentImage && !isLoading} title="New Synthesis Session">
                <HomeIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block text-[11px] font-black uppercase tracking-widest text-blue-400">Generate New</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-center mt-6">
            <div className="flex items-center gap-3 glass px-6 py-3 rounded-full border border-white/10 shadow-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase">Operator ID: {currentUser}</span>
            </div>
            <button className={`flex items-center gap-3 px-7 py-3 rounded-full border transition-all duration-500 group shadow-2xl ${credits === 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'glass border-blue-500/30 text-blue-400'}`}>
              <BoltIcon className={`${credits === 0 ? 'text-red-500' : 'text-blue-500'} group-hover:rotate-12 transition-transform duration-300`} />
              <span className="text-[13px] font-black uppercase tracking-widest">{credits} / 8 Credits</span>
            </button>
          </div>
        </header>

        <div className="w-full max-w-5xl flex flex-col items-center gap-12 pb-72">
          <div className={`group w-full aspect-square relative glass rounded-[56px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.7)] border border-white/10 transition-all duration-1000 ${currentImage ? 'cursor-zoom-in hover:border-blue-500/20' : ''}`} onClick={() => currentImage && setIsZoomed(true)}>
            {(isLoading || isUpscaling || isVariationsLoading) && (
              <SkeletonLoader progress={loadingProgress} stepText={currentLoadingStepText} />
            )}
            {currentImage ? (
              <img src={currentImage.imageUrl} alt={currentImage.prompt} className={`w-full h-full object-cover transition-all duration-1000 ${isLoading || isVariationsLoading ? 'opacity-0 scale-110 blur-3xl' : 'opacity-100 scale-100 blur-0'}`} />
            ) : (
              !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-10 group/placeholder relative overflow-hidden">
                  <img src="https://images.pollinations.ai/prompt/neural%20void%20abstract%20dark%20blue?width=1024&height=1024&nologo=true" className="absolute inset-0 w-full h-full object-cover opacity-5" alt="" />
                  <div className="w-32 h-32 glass rounded-[40px] flex items-center justify-center animate-bounce-slow border border-white/10 shadow-3xl relative z-10">
                    <SparkleIcon className="w-16 h-16 text-blue-500" />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Neural Sync Ready</h2>
                    <p className="text-gray-500 uppercase tracking-[0.5em] text-[12px] font-black opacity-50">Locked to Gemini 2.5 Flash Synthesis</p>
                  </div>
                </div>
              )
            )}
            {currentImage && !isLoading && !isUpscaling && !isVariationsLoading && (
              <div className="absolute bottom-0 left-0 right-0 p-14 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none">
                <p className="text-white text-2xl font-bold italic line-clamp-2 leading-relaxed opacity-90 tracking-tight">"{currentImage.prompt}"</p>
              </div>
            )}
          </div>

          {currentImage && !isLoading && !isUpscaling && !isVariationsLoading && (
            <div className="flex flex-wrap items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <button onClick={handleGenerateNew} className="px-10 py-5 glass rounded-3xl border border-blue-500/30 text-blue-200 font-black uppercase text-[12px] tracking-widest hover:bg-blue-500/20 hover:scale-105 transition-all shadow-3xl flex items-center gap-3 group">
                <HomeIcon className="w-4 h-4 text-blue-400 group-hover:scale-110" />
                Generate New
              </button>
              <button onClick={executeRegenerate} disabled={credits <= 0} className="px-10 py-5 glass rounded-3xl border border-blue-400/20 text-blue-300 font-black uppercase text-[12px] tracking-widest hover:bg-blue-400/10 hover:scale-105 transition-all shadow-3xl flex items-center gap-3 group">
                <BoltIcon className="w-4 h-4 text-blue-400 group-hover:rotate-12" />
                Regenerate
              </button>
              <button onClick={() => setShowUpscaleConfirm(true)} disabled={currentImage.isUpscaled || credits <= 0} className="px-10 py-5 glass rounded-3xl border border-purple-500/30 text-purple-200 font-black uppercase text-[12px] tracking-widest hover:bg-purple-500/20 hover:scale-105 transition-all disabled:opacity-30 shadow-3xl">
                {currentImage.isUpscaled ? '4K Master Archive' : 'Refine to 4K Master (-1)'}
              </button>
              <button onClick={handleCreateVariations} disabled={credits <= 0} className="px-10 py-5 glass rounded-3xl border border-blue-500/30 text-blue-200 font-black uppercase text-[12px] tracking-widest hover:bg-blue-500/20 hover:scale-105 transition-all disabled:opacity-30 shadow-3xl">
                Variant Swarm (-1)
              </button>
              <div className="h-14 w-px bg-white/10 mx-3 hidden md:block"></div>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(currentImage.prompt)}`, '_blank')} className="p-5 glass rounded-[28px] border border-green-500/30 hover:bg-green-500/10 hover:scale-110 transition-all group">
                <WhatsAppIcon className="w-7 h-7 text-green-500" />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(currentImage.imageUrl); showToast("Link Archived."); }} className="p-5 glass rounded-[28px] border border-white/10 hover:bg-white/5 hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316" /></svg>
              </button>
              <button onClick={() => { const a = document.createElement('a'); a.href = currentImage.imageUrl; a.download = 'bamania.png'; a.click(); }} className="p-5 glass rounded-[28px] border border-white/10 hover:bg-white/5 hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          )}

          <section className="w-full mt-24 animate-in fade-in slide-in-from-bottom-20 duration-1000">
             <div className="flex items-center gap-10 mb-14 px-2">
               <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white">Neural Archive</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-blue-500/60 via-blue-500/5 to-transparent"></div>
             </div>
             {history.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 px-2">
                 {history.map((item) => (
                   <div key={item.id} onClick={() => { setCurrentImage(item); mainScrollRef.current?.scrollTo({top: 0, behavior: 'smooth'}); }} className={`group relative aspect-square glass rounded-[44px] overflow-hidden cursor-pointer transition-all duration-700 border-2 ${currentImage?.id === item.id ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-105' : 'border-white/5 hover:border-blue-500/40 hover:-translate-y-2'}`}>
                     <img src={item.imageUrl} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" loading="lazy" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                       <p className="text-[10px] text-white font-black truncate italic uppercase tracking-widest">"{item.prompt}"</p>
                     </div>
                   </div>
                 ))}
                 <AdSlot type="feed" />
               </div>
             ) : (
               <div className="py-32 glass rounded-[64px] border-dashed border-2 border-white/5 flex flex-col items-center opacity-40">
                 <SparkleIcon className="w-12 h-12 mb-6" />
                 <p className="text-[11px] font-black uppercase tracking-[0.4em]">Archive Link Offline</p>
               </div>
             )}
          </section>
        </div>
        <InputBar ref={inputBarRef} credits={credits} currentUser={currentUser || ''} onGenerate={handleGenerate} onEnhance={enhancePrompt} isLoading={isLoading || isVariationsLoading || isUpscaling} />
      </main>

      {showClearConfirm && (
        <div className="fixed inset-0 z-[420] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
          <div className="glass max-w-md w-full p-16 rounded-[64px] border border-red-500/20 shadow-3xl text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <h3 className="text-3xl font-black mb-8 uppercase text-red-500 tracking-tighter">Purge Neural Records?</h3>
            <div className="flex flex-col gap-6">
              <button onClick={() => { setHistory([]); setCurrentImage(null); setShowClearConfirm(false); showToast("Archive Purged."); }} className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Execute Wipe</button>
              <button onClick={() => setShowClearConfirm(false)} className="w-full py-6 glass text-white font-black rounded-3xl uppercase tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

      {showUpscaleConfirm && (
        <div className="fixed inset-0 z-[420] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
          <div className="glass max-w-md w-full p-16 rounded-[64px] border border-purple-500/20 shadow-3xl text-center">
            <SparkleIcon className="w-16 h-16 text-purple-500 mx-auto mb-10" />
            <h3 className="text-3xl font-black mb-8 uppercase text-purple-500 tracking-tighter">Establish 4K Link?</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-10">Refine neural pattern (-1 Credit)</p>
            <div className="flex flex-col gap-6">
              <button onClick={executeUpscale} className="w-full py-6 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Initialize Synthesis</button>
              <button onClick={() => setShowUpscaleConfirm(false)} className="w-full py-6 glass text-white font-black rounded-3xl uppercase tracking-widest">Abort</button>
            </div>
          </div>
        </div>
      )}

      {isZoomed && currentImage && (
        <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-4xl flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-500" onClick={() => setIsZoomed(false)}>
          <img src={currentImage.imageUrl} className="max-w-full max-h-full object-contain rounded-[40px] shadow-3xl border border-white/20" />
        </div>
      )}
    </div>
  );
};

export default App;
