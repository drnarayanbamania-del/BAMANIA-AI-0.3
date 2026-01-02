
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const LOADING_STEPS = [
  "Initializing Neural Pathways...",
  "Consulting Gemini Intelligence...",
  "Drafting Conceptual Layer...",
  "Synthesizing Pixels...",
  "Applying Textural Depth...",
  "Polishing Visual Fidelity...",
  "Finalizing Masterpiece...",
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentImage, setCurrentImage] = useState<HistoryItem | null>(null);
  const [variations, setVariations] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVariationsLoading, setIsVariationsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputBarRef = useRef<InputBarHandle>(null);

  useEffect(() => {
    setApiReady(isApiKeyConfigured());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bamania_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setCurrentImage(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bamania_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    let stepInterval: number;
    let progressInterval: number;

    if (isLoading || isVariationsLoading) {
      setLoadingStep(0);
      setLoadingProgress(5);
      
      stepInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 1800);

      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 98) return 98;
          const increment = prev < 60 ? Math.random() * 3 : Math.random() * 0.5;
          return prev + increment;
        });
      }, 100);
    } else {
      setLoadingProgress(0);
    }

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, isVariationsLoading]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500); // Slightly longer for error visibility
  };

  /**
   * Helper to fetch an image with timeout and status checking
   */
  const verifyImage = async (url: string, timeoutMs: number = 40000): Promise<boolean> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      
      if (response.status === 429) {
        showToast("Rate limit reached. Please wait a few seconds.", "error");
        return false;
      }
      
      if (!response.ok) {
        showToast(`Engine Error (${response.status}): ${response.statusText}`, "error");
        return false;
      }
      
      return true;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        showToast("Request timed out. The creative engine is currently overloaded.", "error");
      } else {
        showToast("Network Error: Please check your internet connection.", "error");
      }
      return false;
    }
  };

  const handleGenerate = useCallback(async (prompt: string, userSeed: number | undefined, resolution: Resolution) => {
    setIsLoading(true);
    setVariations([]);
    const finalSeed = userSeed !== undefined ? userSeed : Math.floor(Math.random() * 2147483647);
    
    const [width, height] = resolution.split('x').map(Number);
    const model = 'flux';
    const encodedPrompt = encodeURIComponent(prompt);
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${finalSeed}&model=${model}&nologo=true`;

    // Robust verification before displaying
    const isAvailable = await verifyImage(imageUrl);
    
    if (isAvailable) {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt,
        imageUrl,
        seed: finalSeed,
        timestamp: Date.now(),
        width,
        height
      };

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setHistory(prev => [newItem, ...prev]);
        setCurrentImage(newItem);
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      };
      img.onerror = () => {
        setIsLoading(false);
        showToast("Image rendering failed. The link might have expired.", "error");
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleCreateVariations = async () => {
    if (!currentImage || isVariationsLoading) return;
    
    setIsVariationsLoading(true);
    const { prompt, width, height } = currentImage;
    const model = 'flux';
    const encodedPrompt = encodeURIComponent(prompt);
    
    const promises = [];

    for (let i = 0; i < 4; i++) {
      const variantSeed = Math.floor(Math.random() * 2147483647);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${variantSeed}&model=${model}&nologo=true`;
      
      const variantItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt,
        imageUrl,
        seed: variantSeed,
        timestamp: Date.now() + i,
        width,
        height
      };
      
      const p = new Promise<HistoryItem | null>(async (resolve) => {
        const isOk = await verifyImage(imageUrl, 60000); // Longer timeout for variations
        if (!isOk) {
          resolve(null);
          return;
        }

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => resolve(variantItem);
        img.onerror = () => resolve(null);
      });
      promises.push(p);
    }

    try {
      const results = await Promise.all(promises);
      const validResults = results.filter((item): item is HistoryItem => item !== null);
      
      if (validResults.length === 0) {
        showToast("All variation attempts failed. Try a different seed.", "error");
      } else if (validResults.length < 4) {
        showToast(`Generated ${validResults.length} variations (some failed).`, "info");
      }

      if (validResults.length > 0) {
        setVariations(validResults);
        setHistory(prev => [...validResults, ...prev]);
        setLoadingProgress(100);
      }
      
      setTimeout(() => setIsVariationsLoading(false), 300);
    } catch (error) {
      console.error("Variations generation failed", error);
      setIsVariationsLoading(false);
      showToast("Variations generation encountered a critical error.", "error");
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    showToast("Preparing download...", "info");
    try {
      const response = await fetch(currentImage.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bamania-ai-${currentImage.seed}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Download started!");
    } catch (error) {
      console.error("Download failed", error);
      showToast("Download failed. The file might no longer be available.", "error");
    }
  };

  const handleShare = async () => {
    if (!currentImage) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bamania AI Creation',
          text: `Check out this AI image: "${currentImage.prompt}"`,
          url: currentImage.imageUrl
        });
        showToast("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(currentImage.imageUrl);
        showToast("Image URL copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed", error);
      showToast("Could not share image.", "error");
    }
  };

  const confirmClearHistory = () => {
    setHistory([]);
    setCurrentImage(null);
    setVariations([]);
    localStorage.removeItem('bamania_history');
    setShowClearConfirm(false);
    showToast("History cleared.");
  };

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentImage?.id === id) {
      setCurrentImage(null);
      setVariations([]);
    }
    showToast("Item deleted.");
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentImage(item);
    setVariations([]);
    setIsSidebarOpen(false);
    if (inputBarRef.current) {
      inputBarRef.current.setPromptAndSeed(item.prompt, item.seed);
    }
  };

  const handleSelectVariation = (item: HistoryItem) => {
    setCurrentImage(item);
  };

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />;
  }

  return (
    <div className="flex min-h-screen bg-[#030712] overflow-hidden">
      {/* Toast System */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto glass px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${
              toast.type === 'error' ? 'border-red-500/30' : 
              toast.type === 'info' ? 'border-blue-500/30' : 'border-green-500/30'
            }`}
          >
            {toast.type === 'success' && <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            {toast.type === 'info' && <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {toast.type === 'error' && <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        ))}
      </div>

      <Sidebar 
        history={history}
        isOpen={isSidebarOpen}
        onSelect={handleSelectHistoryItem}
        onClose={() => setIsSidebarOpen(false)}
        onClear={() => setShowClearConfirm(true)}
        onDeleteItem={handleDeleteItem}
        currentId={currentImage?.id}
      />

      <main className="flex-1 relative flex flex-col items-center justify-start p-4 lg:ml-80 transition-all overflow-y-auto custom-scrollbar pt-24 pb-32">
        {/* Header/Nav */}
        <header className="absolute top-0 left-0 lg:left-80 right-0 p-6 flex items-center justify-between pointer-events-none z-30 glass-dark">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 glass rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              <h1 onClick={() => setView('landing')} className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 whitespace-nowrap">
                <SparkleIcon className="text-blue-500 logo-glow flex-shrink-0" />
                <span className="logo-gradient">BAMANIA AI</span>
              </h1>
              <div className="flex items-center gap-2 mt-1 px-1 whitespace-nowrap">
                <div 
                  className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${apiReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}
                ></div>
                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                  <span>{apiReady ? 'Neural Link Active' : 'Offline Mode'}</span>
                  <span className="opacity-30">|</span>
                  <span className="text-blue-400/80 font-mono">EST. ID: SATERA</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Display Area */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 mt-8">
          <div 
            className={`group w-full aspect-square relative glass rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${currentImage && !isLoading && !isVariationsLoading ? 'cursor-zoom-in hover:scale-[1.01] hover:shadow-blue-500/10' : ''}`}
            onClick={() => currentImage && !isLoading && !isVariationsLoading && setIsZoomed(true)}
          >
            {/* Main Generation Loading State */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center bg-[#030712] overflow-hidden">
                <div className="absolute inset-0 shimmer opacity-10 z-0"></div>
                <div className="absolute inset-0 z-30 pointer-events-none">
                   <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scanline_2s_linear_infinite]"></div>
                </div>

                <div className="relative z-40 flex flex-col items-center px-12">
                  <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-6 border-2 border-purple-500/10 rounded-full"></div>
                    <div className="absolute inset-6 border-2 border-b-purple-500 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1s]"></div>
                    <SparkleIcon className="w-12 h-12 text-white animate-pulse" />
                  </div>

                  <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-2">
                       <p className="text-xs font-mono text-blue-400 tracking-[0.2em] uppercase font-bold">Synthesizing Imagery</p>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out" 
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-500 tracking-wider">
                        <span>{Math.round(loadingProgress)}% ATOMS ALIGNED</span>
                        <span>TASK {loadingStep + 1}/7</span>
                      </div>
                    </div>

                    <div className="h-12 flex items-center justify-center">
                      <p className="text-xl font-medium text-white/90 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center leading-tight" key={loadingStep}>
                        {LOADING_STEPS[loadingStep]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentImage ? (
              <img 
                src={currentImage.imageUrl} 
                alt={currentImage.prompt} 
                className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              />
            ) : (
              !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-20 h-20 glass rounded-full flex items-center justify-center animate-bounce-slow">
                    <SparkleIcon className="w-10 h-10 text-blue-500 logo-glow" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Visualize Your Future</h2>
                  <p className="text-gray-400 max-w-md">Bamania AI is ready. Describe your vision and let the Gemini-powered engine work its magic.</p>
                </div>
              )
            )}
            
            {currentImage && !isLoading && !isVariationsLoading && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none group-hover:from-black/95 transition-all">
                <p className="text-white text-lg font-medium drop-shadow-lg line-clamp-2 italic">
                  "{currentImage.prompt}"
                </p>
              </div>
            )}
          </div>

          {/* Action Button Bar */}
          {(currentImage || isLoading) && (
             <div className="flex flex-wrap items-center justify-center gap-3 w-full min-h-[50px]">
               {isLoading ? (
                 <>
                   <div className="w-24 h-9 glass rounded-full shimmer opacity-20"></div>
                   <div className="w-24 h-9 glass rounded-full shimmer opacity-20"></div>
                   <div className="w-32 h-10 glass rounded-full shimmer opacity-20 ml-2"></div>
                   <div className="w-32 h-10 glass rounded-full shimmer opacity-20"></div>
                 </>
               ) : (
                 !isVariationsLoading && (
                  <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                      <span className="font-mono">{currentImage!.width}x{currentImage!.height}</span>
                    </div>
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16" /></svg>
                      <span className="font-mono">Seed: {currentImage!.seed}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleCreateVariations}
                        className="flex items-center gap-2 px-5 py-2.5 glass rounded-full hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all font-medium border border-purple-500/20 group text-purple-200"
                      >
                        <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                        <span>Variations</span>
                      </button>

                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 glass rounded-full hover:bg-white/10 hover:shadow-white/5 transition-all font-medium border border-white/10 group"
                      >
                        <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span>Download</span>
                      </button>
                      
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 glass rounded-full hover:bg-white/10 hover:shadow-white/5 transition-all font-medium border border-white/10 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                 )
               )}
             </div>
          )}

          {/* Variations Grid / Skeletons */}
          {(variations.length > 0 || isVariationsLoading) && (
            <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/10"></div>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
                  {isVariationsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <span>Exploring Possibilities</span>
                    </>
                  ) : (
                    <span>Neural Variants</span>
                  )}
                </h3>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isVariationsLoading ? (
                  // Variation Grid Skeletons
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square glass rounded-2xl overflow-hidden relative">
                      <div className="absolute inset-0 shimmer opacity-20"></div>
                      <div className="absolute inset-4 border border-white/5 rounded-xl"></div>
                    </div>
                  ))
                ) : (
                  variations.map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => handleSelectVariation(v)}
                      className={`group relative aspect-square glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 ${currentImage?.id === v.id ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20 scale-[1.02]' : ''}`}
                    >
                      <img src={v.imageUrl} alt="Variation" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-[10px] font-bold text-white uppercase tracking-wider">Select</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <InputBar 
          ref={inputBarRef}
          onGenerate={handleGenerate}
          onEnhance={enhancePrompt}
          isLoading={isLoading || isVariationsLoading}
        />
      </main>

      {/* Zoom Modal */}
      {isZoomed && currentImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 glass rounded-full text-white hover:bg-white/20 transition-all z-[110]"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center gap-6" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentImage.imageUrl} 
              alt={currentImage.prompt} 
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="glass p-6 rounded-2xl max-w-2xl w-full text-center">
              <p className="text-white text-lg font-medium italic mb-2">"{currentImage.prompt}"</p>
              <div className="text-sm text-gray-400 font-mono">Seed: {currentImage.seed} • Resolution: {currentImage.width}x{currentImage.height}</div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass max-w-sm w-full p-8 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2 px-2 leading-tight">Are you sure you want to clear all history?</h3>
            <p className="text-gray-400 text-sm text-center mb-8 px-4">This action cannot be undone and will permanently delete all your generated creations from this device.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmClearHistory}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Yes, Clear All
              </button>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
