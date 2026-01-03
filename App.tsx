
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import InputBar, { InputBarHandle } from './components/InputBar';
import AdSlot from './components/AdSlot';
import NeuralPlaceholder from './components/NeuralPlaceholder';
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
      } catch (e) {
        console.error("Neural state mismatch. Resetting archive.");
      }

      const today = new Date().toISOString().split('T')[0];
      const lastRefresh = localStorage.getItem(refreshKey);
      const savedCredits = localStorage.getItem(creditKey);

      if (lastRefresh !== today) {
        setCredits(MAX_DAILY_CREDITS);
        localStorage.setItem(refreshKey, today);
        localStorage.setItem(creditKey, MAX_DAILY_CREDITS.toString());
      } else if (savedCredits !== null) {
        setCredits(parseInt(savedCredits, 10));
      } else {
        setCredits(MAX_DAILY_CREDITS);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const limitedHistory = history.slice(0, MAX_HISTORY_LIMIT);
      localStorage.setItem(`bamania_history_${currentUser}`, JSON.stringify(limitedHistory));
    }
  }, [history, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`bamania_credits_${currentUser}`, credits.toString());
    }
  }, [credits, currentUser]);

  useEffect(() => {
    let stepInterval: number;
    let progressInterval: number;
    const activeLoading = isLoading || isVariationsLoading || isUpscaling;
    const steps = isUpscaling ? UPSCALE_STEPS : (isVariationsLoading ? VARIATION_STEPS : LOADING_STEPS);

    if (activeLoading) {
      setLoadingStep(0);
      setLoadingProgress(5);
      stepInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
      }, 1000);

      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 98) return 98;
          return prev + Math.random() * 2;
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
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLogin = (id: string) => {
    setCurrentUser(id);
    setView('app');
    showToast(`Neural Authorization Success.`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistory([]);
    setCredits(MAX_DAILY_CREDITS);
    setCurrentImage(null);
    setView('landing');
    showToast("Identity Logged Out.", "info");
  };

  const handleRefillCredits = () => {
    setCredits(MAX_DAILY_CREDITS);
    showToast(`Neural Credits Restored.`, "success");
  };

  // Fix: Pass seed and ensure direct process.env.API_KEY usage
  const handleGenerate = useCallback(async (prompt: string, userSeed: number | undefined, resolution: Resolution) => {
    if (credits <= 0) {
      showToast("Identity credits exhausted.", "error");
      return;
    }

    if (!process.env.API_KEY) {
      showToast("Gemini Link Offline.", "error");
      return;
    }

    const startTime = performance.now();
    setIsLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          },
          seed: userSeed
        }
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
        const generationTime = (endTime - startTime) / 1000;
        const [width, height] = resolution.split('x').map(Number);
        
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          prompt,
          imageUrl: base64Image,
          seed: userSeed || Math.floor(Math.random() * 999999),
          timestamp: Date.now(),
          width,
          height,
          generationTime: parseFloat(generationTime.toFixed(1)),
          isFavorite: false
        };

        setHistory(prev => [newItem, ...prev]);
        setCurrentImage(newItem);
        setCredits(prev => Math.max(0, prev - 1));
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error("Empty visual buffer.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      showToast("Neural Synthesis Failed.", "error");
    }
  }, [credits]);

  // Fix: Support image-to-image upscale and use direct API key
  const executeUpscale = async () => {
    if (!currentImage || isUpscaling || credits <= 0) return;
    setShowUpscaleConfirm(false);
    
    if (!process.env.API_KEY) return;

    const startTime = performance.now();
    setIsUpscaling(true);
    showToast("Establishing 4K Link...", "info");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const upscalePrompt = `Ultra HD, hyper-detailed, 8k masterpiece: ${currentImage.prompt}`;
      const base64Data = currentImage.imageUrl.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: upscalePrompt }
          ] 
        },
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
        const generationTime = (endTime - startTime) / 1000;
        
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          prompt: currentImage.prompt,
          imageUrl: base64Image,
          seed: currentImage.seed,
          timestamp: Date.now(),
          width: 2048,
          height: 2048,
          isUpscaled: true,
          generationTime: parseFloat(generationTime.toFixed(1)),
          isFavorite: currentImage.isFavorite
        };

        setHistory(prev => [newItem, ...prev]);
        setCurrentImage(newItem);
        setCredits(prev => Math.max(0, prev - 1));
        setLoadingProgress(100);
        showToast("4K Masterpiece Generated.");
        setTimeout(() => setIsUpscaling(false), 300);
      }
    } catch (error) {
      setIsUpscaling(false);
      showToast("4K Link Failure.", "error");
    }
  };

  // Fix: Support image-to-image variations and use direct API key
  const handleCreateVariations = async () => {
    if (credits <= 0) {
      showToast("Insufficient credits.", "error");
      return;
    }
    if (!currentImage || isVariationsLoading) return;
    
    if (!process.env.API_KEY) return;

    setIsVariationsLoading(true);
    setLoadingProgress(10);
    showToast("Synthesizing Variant Swarm...", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.imageUrl.split(',')[1];
      const variationPrompt = `A creative visual variation of: ${currentImage.prompt}. Masterpiece, cinematic lighting, unique interpretation.`;
      
      const swarmPromises = [1, 2, 3, 4].map(async () => {
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { 
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/png' } },
              { text: variationPrompt }
            ] 
          },
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
        showToast(`Swarm Synthesis Complete: ${validResults.length} variations added.`);
      }
      setLoadingProgress(100);
      setTimeout(() => setIsVariationsLoading(false), 400);
    } catch (error) {
      setIsVariationsLoading(false);
      showToast("Swarm Protocol Failure.", "error");
    }
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
    if (currentImage?.id === id) {
      setCurrentImage(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage.imageUrl;
    link.download = `bamania-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!currentImage) return;
    try {
      await navigator.clipboard.writeText(currentImage.imageUrl);
      showToast("Synthesis link copied to clipboard.");
    } catch (error) {
      showToast("Clipboard link failure.", "error");
    }
  };

  const handleWhatsAppShare = () => {
    if (!currentImage) return;
    const text = encodeURIComponent(`Bamania AI Neural Design: "${currentImage.prompt}"`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDeleteItem = (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    setHistory(prev => prev.filter(item => !idList.includes(item.id)));
    if (currentImage && idList.includes(currentImage.id)) {
      setCurrentImage(null);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item);
    setIsSidebarOpen(false);
    if (inputBarRef.current) inputBarRef.current.setPromptAndSeed(item.prompt, item.seed);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'landing' || !currentUser) {
    return <LandingPage onEnter={handleLogin} />;
  }

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
        onSelect={handleSelectHistoryItem}
        onClose={() => setIsSidebarOpen(false)}
        onClear={() => setShowClearConfirm(true)}
        onDeleteItem={handleDeleteItem}
        onToggleFavorite={toggleFavorite}
        onRefillCredits={handleRefillCredits}
        onLogout={handleLogout}
        currentUser={currentUser}
        currentId={currentImage?.id}
      />

      <main ref={mainScrollRef} className="flex-1 relative flex flex-col items-center justify-start p-6 lg:ml-80 transition-all overflow-y-auto custom-scrollbar scroll-smooth">
        <header className="w-full max-w-5xl pt-10 pb-16 flex flex-col items-center text-center relative z-30">
          <div className="flex items-center gap-6 mb-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-4 whitespace-nowrap group">
              <SparkleIcon className="text-blue-500 logo-glow w-12 h-12 shrink-0 group-hover:scale-110 transition-transform duration-500" />
              <h1 className="text-5xl font-black tracking-tighter logo-gradient uppercase text-white">BAMANIA AI</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="flex items-center gap-3 glass px-6 py-3 rounded-full border border-white/10 shadow-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase">Operator ID: {currentUser}</span>
            </div>
            <button className={`flex items-center gap-3 px-7 py-3 rounded-full border transition-all duration-500 group hover:scale-105 active:scale-95 shadow-2xl ${credits === 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'glass border-blue-500/30 text-blue-400'}`}>
              <BoltIcon className={`${credits === 0 ? 'text-red-500' : 'text-blue-500'} group-hover:rotate-12 transition-transform duration-300`} />
              <span className="text-[13px] font-black uppercase tracking-widest">{credits} / 8 <span className="text-[11px] opacity-40 ml-1">Credits</span></span>
            </button>
          </div>
        </header>

        <div className="w-full max-w-5xl flex flex-col items-center gap-12 pb-72">
          <div className={`group w-full aspect-square relative glass rounded-[56px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.7)] border border-white/10 transition-all duration-1000 ${currentImage ? 'cursor-zoom-in hover:border-blue-500/20' : ''}`} onClick={() => currentImage && setIsZoomed(true)}>
            {(isLoading || isUpscaling || isVariationsLoading) && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030712]/98 backdrop-blur-3xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.9)] animate-[scanline_2s_linear_infinite]"></div>
                <div className="relative flex flex-col items-center max-w-sm w-full px-10">
                  <div className="w-64 h-64 mb-20 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-[12px] border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[12px] border-blue-500 border-t-transparent rounded-full animate-spin duration-[2s]"></div>
                    <SparkleIcon className="w-24 h-24 text-blue-400 animate-pulse drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
                  </div>
                  <div className="w-full space-y-10 text-center">
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 transition-all duration-700 shadow-[0_0_20px_rgba(59,130,246,0.6)]" style={{ width: `${loadingProgress}%` }}></div>
                    </div>
                    <p className="text-3xl font-black text-white uppercase tracking-[0.25em] animate-pulse">
                      {isUpscaling ? UPSCALE_STEPS[loadingStep] : (isVariationsLoading ? VARIATION_STEPS[loadingStep] : LOADING_STEPS[loadingStep])}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentImage ? (
              <img 
                src={currentImage.imageUrl} 
                alt={currentImage.prompt} 
                className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isLoading || isVariationsLoading ? 'opacity-0 scale-110 blur-3xl' : 'opacity-100 scale-100 blur-0'}`} 
              />
            ) : (
              !isLoading && !isVariationsLoading && (
                <div className="h-full flex flex-col items-center justify-center space-y-10">
                  <NeuralPlaceholder 
                    variant="main" 
                    title="Initiate Neural Sync" 
                    description="Gemini 2.5 Flash Synthesis Engine is Ready" 
                  />
                  <button 
                    onClick={() => inputBarRef.current?.focusInput()}
                    className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group flex items-center gap-4 mx-auto relative z-10"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    START SYNTHESIS
                  </button>
                </div>
              )
            )}
            
            {currentImage && !isLoading && !isUpscaling && !isVariationsLoading && (
              <div className="absolute bottom-0 left-0 right-0 p-14 bg-gradient-to-t from-black/98 via-black/40 to-transparent pointer-events-none">
                <p className="text-white text-2xl font-bold italic line-clamp-2 leading-relaxed opacity-90 tracking-tight">"{currentImage.prompt}"</p>
              </div>
            )}
          </div>

          {currentImage && !isLoading && !isUpscaling && !isVariationsLoading && (
            <div className="flex flex-wrap items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <button onClick={() => setShowUpscaleConfirm(true)} disabled={currentImage.isUpscaled || credits <= 0} className="px-10 py-5 glass rounded-3xl border border-purple-500/30 text-purple-200 font-black uppercase text-[12px] tracking-widest hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-3xl">
                {currentImage.isUpscaled ? '4K Master Archive' : 'Refine to 4K Master (-1)'}
              </button>
              <button onClick={handleCreateVariations} disabled={credits <= 0} className="px-10 py-5 glass rounded-3xl border border-blue-500/30 text-blue-200 font-black uppercase text-[12px] tracking-widest hover:bg-blue-500/20 hover:border-blue-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-3xl">
                Create Variations (-1)
              </button>
              <div className="h-14 w-px bg-white/10 mx-3"></div>
              <button onClick={handleWhatsAppShare} className="p-5 glass rounded-[28px] border border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 hover:scale-110 active:scale-90 transition-all group" title="WhatsApp Share">
                <WhatsAppIcon className="w-7 h-7 text-green-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={handleShare} className="p-5 glass rounded-[28px] border border-white/10 hover:bg-white/5 hover:border-white/20 hover:scale-110 active:scale-90 transition-all group" title="Copy System Link">
                <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316" /></svg>
              </button>
              <button onClick={handleDownload} className="p-5 glass rounded-[28px] border border-white/10 hover:bg-white/5 hover:border-white/20 hover:scale-110 active:scale-90 transition-all group" title="Download High-Res Synthesis">
                <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          )}

          <section className="w-full mt-24 animate-in fade-in slide-in-from-bottom-20 duration-1000">
             <div className="flex items-center gap-10 mb-14 px-2">
               <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white whitespace-nowrap">Neural Archive</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-blue-500/60 via-blue-500/10 to-transparent"></div>
             </div>
             
             {history.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 px-2">
                 {history.map((item) => (
                   <div key={item.id} onClick={() => handleSelectHistoryItem(item)} className={`group relative aspect-square glass rounded-[44px] overflow-hidden cursor-pointer transition-all duration-700 border-2 ${currentImage?.id === item.id ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.4)] scale-105' : 'border-white/5 hover:border-blue-500/40 hover:-translate-y-2'}`}>
                     <img 
                      src={item.imageUrl} 
                      onError={(e) => (e.currentTarget.src = 'https://images.pollinations.ai/prompt/error%20corrupt%20data%20glitch%20dark?nologo=true')} 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-7 flex flex-col justify-end">
                       <p className="text-[11px] text-white font-black truncate italic mb-2 tracking-tight">"{item.prompt}"</p>
                       <div className="flex justify-between items-center">
                         <div className="flex gap-2.5">
                           <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.width}PX</span>
                           {item.isUpscaled && <span className="text-[10px] text-purple-400 font-black uppercase">4K MASTER</span>}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
                 <AdSlot type="feed" />
               </div>
             ) : (
               <div className="glass rounded-[64px] border-white/5 border-dashed border-2">
                 <NeuralPlaceholder 
                    variant="archive" 
                    title="Neural Log Inactive" 
                    description="Synchronize Patterns to Populate Gallery." 
                 />
               </div>
             )}
          </section>
        </div>

        <InputBar ref={inputBarRef} credits={credits} currentUser={currentUser || ''} onGenerate={handleGenerate} onEnhance={enhancePrompt} isLoading={isLoading || isVariationsLoading || isUpscaling} />
      </main>

      {/* Fullscreen Preview */}
      {isZoomed && currentImage && (
        <div className="fixed inset-0 z-[400] bg-black/98 backdrop-blur-4xl flex items-center justify-center p-10 cursor-zoom-out animate-in fade-in duration-500" onClick={() => setIsZoomed(false)}>
          <div className="relative group max-w-full max-h-[92vh]">
            <img src={currentImage.imageUrl} className="w-full h-full object-contain rounded-[56px] shadow-[0_0_200px_rgba(59,130,246,0.35)] border border-white/20" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 glass px-10 py-5 rounded-3xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-xl">
              <p className="text-white text-base font-black uppercase tracking-[0.3em]">{currentImage.width}x{currentImage.height} NEURAL MASTERPIECE</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Overlays */}
      {showUpscaleConfirm && (
        <div className="fixed inset-0 z-[420] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
          <div className="glass max-w-md w-full p-16 rounded-[64px] border border-white/10 shadow-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="w-24 h-24 bg-purple-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-purple-500/30 shadow-2xl">
              <SparkleIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-4xl font-black mb-8 uppercase text-purple-400 tracking-tighter">Establish 4K Link</h3>
            <p className="text-gray-400 mb-14 font-medium leading-loose uppercase text-[12px] tracking-widest opacity-80">Refine this neural construct into an ultra-high fidelity visual masterpiece? (-1 Credit)</p>
            <div className="flex flex-col gap-6">
              <button onClick={executeUpscale} className="w-full py-7 bg-purple-600 text-white font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-purple-500 hover:scale-[1.03] active:scale-97 transition-all shadow-3xl">Initialize Protocol</button>
              <button onClick={() => setShowUpscaleConfirm(false)} className="w-full py-7 glass text-white font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-white/5 transition-all">Abort Link</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[420] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
          <div className="glass max-w-md w-full p-16 rounded-[64px] border border-white/10 shadow-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-red-500/30 shadow-2xl">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-4xl font-black mb-8 uppercase text-red-500 tracking-tighter">Database Purge</h3>
            <p className="text-gray-400 mb-14 font-medium uppercase text-[12px] tracking-widest leading-loose opacity-80">Erasing local neural synthesis records. Proceed?</p>
            <div className="flex flex-col gap-6">
              <button onClick={() => {
                setHistory([]);
                setCurrentImage(null);
                setShowClearConfirm(false);
                showToast("Archive Wiped.");
              }} className="w-full py-7 bg-red-600 text-white font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-red-500 hover:scale-[1.03] active:scale-97 transition-all shadow-3xl">Execute Wipe</button>
              <button onClick={() => setShowClearConfirm(false)} className="w-full py-7 glass text-white font-black rounded-3xl uppercase tracking-[0.3em] text-xs hover:bg-white/5 transition-all">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
