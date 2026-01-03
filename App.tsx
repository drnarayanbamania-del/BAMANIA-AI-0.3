
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import InputBar, { InputBarHandle } from './components/InputBar';
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
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.894 4.44-9.897 9.887-.001 2.155.593 4.256 1.72 6.038l-1.102 4.025 4.149-1.087zm11.646-7.391c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.199.3-.775.979-.95 1.179-.175.199-.349.225-.65.075-.301-.15-1.27-.467-2.42-1.493-.894-.797-1.496-1.782-1.672-2.081-.175-.3-.019-.462.131-.611.135-.134.301-.351.45-.525.15-.175.199-.3.3-.5.1-.199.05-.374-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.009-.374-.01-.574-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.925 1.225 3.125c.15.199 2.113 3.227 5.118 4.524.714.309 1.273.493 1.708.632.717.228 1.369.196 1.885.119.574-.085 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.226-.575-.376z"/>
  </svg>
);

const MAX_DAILY_CREDITS = 8;

const LOADING_STEPS = [
  "Initializing Neural Pathways...",
  "Consulting Gemini Intelligence...",
  "Synthesizing Pixels...",
  "Applying Textural Depth...",
  "Polishing Visual Fidelity...",
  "Finalizing Masterpiece...",
];

const UPSCALE_STEPS = [
  "Sampling Texture Data...",
  "Enhancing Edge Fidelity...",
  "Refining Spectral Detail...",
  "Finalizing Ultra-HD Export...",
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
  const [variations, setVariations] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isVariationsLoading, setIsVariationsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUpscaleConfirm, setShowUpscaleConfirm] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputBarRef = useRef<InputBarHandle>(null);

  useEffect(() => {
    setApiReady(isApiKeyConfigured());
  }, []);

  useEffect(() => {
    if (currentUser) {
      const storageKey = `bamania_history_${currentUser}`;
      const creditKey = `bamania_credits_${currentUser}`;
      const refreshKey = `bamania_last_refresh_${currentUser}`;
      
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(parsed);
          if (parsed.length > 0) setCurrentImage(parsed[0]);
        } catch (e) {
          console.error("Failed to parse user history", e);
        }
      } else {
        setHistory([]);
        setCurrentImage(null);
      }

      const today = new Date().toISOString().split('T')[0];
      const lastRefresh = localStorage.getItem(refreshKey);
      const savedCredits = localStorage.getItem(creditKey);

      if (lastRefresh !== today) {
        setCredits(MAX_DAILY_CREDITS);
        localStorage.setItem(refreshKey, today);
        localStorage.setItem(creditKey, MAX_DAILY_CREDITS.toString());
        showToast(`New cycle detected. Daily credits restored to ${MAX_DAILY_CREDITS}.`);
      } else if (savedCredits !== null) {
        setCredits(parseInt(savedCredits, 10));
      } else {
        setCredits(MAX_DAILY_CREDITS);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`bamania_history_${currentUser}`, JSON.stringify(history));
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
    const steps = isUpscaling ? UPSCALE_STEPS : LOADING_STEPS;

    if (activeLoading) {
      setLoadingStep(0);
      setLoadingProgress(5);
      
      stepInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
      }, isUpscaling ? 800 : 1000);

      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 5;
        });
      }, 200);
    } else {
      setLoadingProgress(0);
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
    }, 4500);
  };

  const handleLogin = (id: string) => {
    setCurrentUser(id);
    setView('app');
    showToast(`Welcome back, ${id}. Neural link established.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistory([]);
    setCredits(MAX_DAILY_CREDITS);
    setCurrentImage(null);
    setVariations([]);
    setView('landing');
    showToast("Session terminated. Link offline.");
  };

  const handleRefillCredits = () => {
    setCredits(MAX_DAILY_CREDITS);
    showToast(`Neural Credits Restored to ${MAX_DAILY_CREDITS}.`);
  };

  const handleGenerate = useCallback(async (prompt: string, userSeed: number | undefined, resolution: Resolution) => {
    if (credits <= 0) {
      showToast("Identity credits depleted.", "error");
      return;
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showToast("Neural Engine unavailable (Missing API Key).", "error");
      return;
    }

    const startTime = performance.now();
    setIsLoading(true);
    setVariations([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Image = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
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
          seed: userSeed || 0,
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
        setTimeout(() => setIsLoading(false), 200);
      } else {
        throw new Error("No image data in response");
      }
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      setIsLoading(false);
      showToast("Fast Synthesis Failed. Retrying...", "error");
    }
  }, [credits]);

  const handleUpscaleRequest = () => {
    if (!currentImage || isUpscaling || currentImage.isUpscaled) return;
    if (credits <= 0) {
      showToast("Insufficient credits.", "error");
      return;
    }
    setShowUpscaleConfirm(true);
  };

  const executeUpscale = async () => {
    if (!currentImage || isUpscaling || credits <= 0) return;
    setShowUpscaleConfirm(false);
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;

    const startTime = performance.now();
    setIsUpscaling(true);
    showToast("Initializing High-Fidelity Refinement...", "info");
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const upscalePrompt = `Upscale this concept to extreme detail, cinematic, 8k, hyper-realistic: ${currentImage.prompt}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: upscalePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Image = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
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
        showToast("4K Neural Synthesis Complete.");
        setTimeout(() => setIsUpscaling(false), 200);
      }
    } catch (error) {
      setIsUpscaling(false);
      showToast("Upscale Synthesis Failed.", "error");
    }
  };

  const handleCreateVariations = async () => {
    if (credits <= 0) {
      showToast("Credits required for variants.", "error");
      return;
    }
    if (!currentImage || isVariationsLoading) return;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) return;

    setIsVariationsLoading(true);
    showToast("Spawning Neural Variants...", "info");

    try {
      const ai = new GoogleGenAI({ apiKey });
      const variationPrompt = `Create a creative variation of this: ${currentImage.prompt}`;
      
      const promises = [1, 2].map(async () => {
        const resp = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: variationPrompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });
        
        for (const part of resp.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
      });

      const results = await Promise.all(promises);
      const validResults: HistoryItem[] = results
        .filter((url): url is string => url !== null)
        .map((url, i) => ({
          id: crypto.randomUUID(),
          prompt: currentImage.prompt,
          imageUrl: url,
          seed: Math.floor(Math.random() * 1000),
          timestamp: Date.now() + i,
          width: currentImage.width,
          height: currentImage.height,
          generationTime: 1.5,
          isFavorite: false
        }));

      if (validResults.length > 0) {
        setVariations(validResults);
        setHistory(prev => [...validResults, ...prev]);
        setCredits(prev => Math.max(0, prev - 1));
        showToast("Variations established.");
      }
      setIsVariationsLoading(false);
    } catch (error) {
      setIsVariationsLoading(false);
      showToast("Variant Synthesis Failed.", "error");
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
    link.download = `bamania-gen-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!currentImage) return;
    try {
      const response = await fetch(currentImage.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'bamania-gen.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Bamania AI',
          text: `Neural Synthesis: "${currentImage.prompt}"`,
        });
      } else if (navigator.share) {
        await navigator.share({ 
          title: 'Bamania AI', 
          text: `Check out this AI generation: "${currentImage.prompt}"`, 
          url: window.location.href 
        });
      } else {
        await navigator.clipboard.writeText(currentImage.imageUrl);
        showToast("Image URI copied to clipboard!");
      }
    } catch (error) {
      showToast("Sharing failed.", "error");
    }
  };

  const handleWhatsAppShare = () => {
    if (!currentImage) return;
    const text = encodeURIComponent(`Check out this AI generation from Bamania AI: "${currentImage.prompt}"\n\nGenerated via Bamania AI Synthesis Engine.`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const confirmClearHistory = () => {
    setHistory([]);
    setCurrentImage(null);
    setVariations([]);
    if (currentUser) localStorage.removeItem(`bamania_history_${currentUser}`);
    setShowClearConfirm(false);
  };

  const handleDeleteItem = (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    setHistory(prev => prev.filter(item => !idList.includes(item.id)));
    if (currentImage && idList.includes(currentImage.id)) {
      setCurrentImage(null);
      setVariations([]);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item);
    setVariations([]);
    setIsSidebarOpen(false);
    if (inputBarRef.current) inputBarRef.current.setPromptAndSeed(item.prompt, item.seed);
  };

  const handleSelectVariation = (item: HistoryItem) => {
    setCurrentImage(item);
  };

  const handleShowBalance = () => {
    showToast(`Neural Capacity: ${credits}/${MAX_DAILY_CREDITS}. Refreshing daily.`, credits < 3 ? 'error' : 'success');
  };

  if (view === 'landing' || !currentUser) {
    return <LandingPage onEnter={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#030712] overflow-hidden text-slate-200">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto glass px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span className="text-sm font-bold text-white uppercase tracking-widest">{toast.message}</span>
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

      <main className="flex-1 relative flex flex-col items-center justify-start p-4 lg:ml-80 transition-all overflow-y-auto custom-scrollbar">
        <header className="w-full max-w-4xl pt-8 pb-12 flex flex-col items-center text-center relative z-30">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 glass rounded-xl border border-white/10">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-3">
              <SparkleIcon className="text-blue-500 logo-glow w-8 h-8" />
              <h1 className="text-3xl font-black tracking-tighter logo-gradient uppercase text-white">BAMANIA AI</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Neural ID: {currentUser}</span>
            </div>
            
            <button 
              onClick={handleShowBalance}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-full border transition-all duration-300 group hover:scale-105 active:scale-95 shadow-lg ${
                credits === 0 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'glass border-blue-500/20 text-blue-400'
              }`}
            >
              <BoltIcon className={`${credits === 0 ? 'text-red-500' : 'text-blue-500'} group-hover:animate-pulse`} />
              <span className="text-[11px] font-black uppercase tracking-widest">{credits} / {MAX_DAILY_CREDITS} <span className="text-[9px] opacity-40 ml-1">Credits</span></span>
            </button>

            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
            <span className="text-[10px] font-black tracking-[0.4em] text-blue-500/80 uppercase hidden md:inline-block">Status: Synced</span>
          </div>
        </header>

        <div className="w-full max-w-4xl flex flex-col items-center gap-8 mb-32">
          <div 
            className={`group w-full aspect-square relative glass rounded-[40px] overflow-hidden shadow-2xl border border-white/10 transition-all duration-700 ${currentImage ? 'cursor-zoom-in hover:scale-[1.01]' : ''}`}
            onClick={() => currentImage && setIsZoomed(true)}
          >
            {(isLoading || isUpscaling) && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-3xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/50 animate-[scanline_2s_linear_infinite]"></div>
                <div className="relative flex flex-col items-center max-w-sm w-full px-8">
                  <div className="w-48 h-48 mb-12 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-8 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <SparkleIcon className="w-16 h-16 text-blue-400 animate-pulse" />
                  </div>
                  <div className="w-full space-y-6">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                    </div>
                    <p className="text-xl font-bold text-white text-center uppercase tracking-widest">{isUpscaling ? UPSCALE_STEPS[loadingStep] : LOADING_STEPS[loadingStep]}</p>
                  </div>
                </div>
              </div>
            )}

            {currentImage ? (
              <img src={currentImage.imageUrl} alt={currentImage.prompt} className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`} />
            ) : (
              !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-16 space-y-6">
                  <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center animate-bounce-slow border border-white/10">
                    <SparkleIcon className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize Concept</h2>
                </div>
              )
            )}
            
            {currentImage && !isLoading && !isUpscaling && !isVariationsLoading && (
              <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                <p className="text-white text-lg font-bold italic line-clamp-2">"{currentImage.prompt}"</p>
              </div>
            )}
          </div>

          {currentImage && !isLoading && !isUpscaling && (
            <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <button onClick={handleUpscaleRequest} disabled={currentImage.isUpscaled || credits <= 0} className="px-6 py-3.5 glass rounded-2xl border border-purple-500/20 text-purple-200 font-bold uppercase text-[10px] tracking-widest hover:bg-purple-500/20 transition-all disabled:opacity-30">
                {currentImage.isUpscaled ? '4K Master' : 'Upscale Master (-1)'}
              </button>
              <button onClick={handleCreateVariations} disabled={credits <= 0} className="px-6 py-3.5 glass rounded-2xl border border-blue-500/20 text-blue-200 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-30">
                Neural Variants (-1)
              </button>
              
              <div className="h-10 w-px bg-white/10 mx-2"></div>

              <button onClick={handleWhatsAppShare} className="p-3.5 glass rounded-2xl border border-green-500/20 hover:bg-green-500/10 transition-all group" title="Share to WhatsApp">
                <WhatsAppIcon className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={handleShare} className="p-3.5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all group" title="System Share">
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316" /></svg>
              </button>
              <button onClick={handleDownload} className="p-3.5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all group" title="Download Image">
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          )}

          {(variations.length > 0 || isVariationsLoading) && (
            <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isVariationsLoading ? [...Array(2)].map((_, i) => <div key={i} className="aspect-square glass rounded-[30px] shimmer"></div>) : 
                  variations.map((v) => <div key={v.id} onClick={() => handleSelectVariation(v)} className="group relative aspect-square glass rounded-[30px] overflow-hidden cursor-pointer hover:scale-105 transition-all border border-white/5"><img src={v.imageUrl} className="w-full h-full object-cover" /></div>)}
              </div>
            </div>
          )}
        </div>

        <InputBar ref={inputBarRef} credits={credits} onGenerate={handleGenerate} onEnhance={enhancePrompt} isLoading={isLoading || isVariationsLoading || isUpscaling} />
      </main>

      {isZoomed && currentImage && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-8 cursor-zoom-out" onClick={() => setIsZoomed(false)}>
          <img src={currentImage.imageUrl} className="max-w-full max-h-[85vh] rounded-[40px] shadow-2xl border border-white/10" />
        </div>
      )}

      {showUpscaleConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass max-w-md w-full p-12 rounded-[40px] border border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black text-center mb-4 uppercase text-purple-400">Neural Master</h3>
            <p className="text-gray-300 text-center mb-10 font-medium leading-relaxed">Consume 1 credit for high-fidelity 4K synthesis?</p>
            <div className="flex flex-col gap-4">
              <button onClick={executeUpscale} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Execute (-1 Credit)</button>
              <button onClick={() => setShowUpscaleConfirm(false)} className="w-full py-5 glass text-white font-black rounded-2xl uppercase tracking-widest text-xs">Abort</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass max-w-md w-full p-12 rounded-[40px] border border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black text-center mb-4 uppercase text-red-500">Wipe User Data?</h3>
            <p className="text-gray-400 text-center mb-10 font-medium">This will permanently clear your local archives for this Neural ID.</p>
            <div className="flex flex-col gap-4">
              <button onClick={confirmClearHistory} className="w-full py-5 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Wipe Memory</button>
              <button onClick={() => setShowClearConfirm(false)} className="w-full py-5 glass text-white font-black rounded-2xl uppercase tracking-widest text-xs">Abort</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
