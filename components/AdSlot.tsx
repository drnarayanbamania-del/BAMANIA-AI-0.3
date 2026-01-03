
import React, { useEffect, useRef } from 'react';

interface AdSlotProps {
  type: 'sidebar' | 'feed' | 'banner';
  className?: string;
}

const AdSlot: React.FC<AdSlotProps> = ({ type, className = "" }) => {
  const adRef = useRef<HTMLDivElement>(null);

  // Note: For real AdSterra integration, you would place your script here.
  // This component provides the structural and aesthetic container.
  useEffect(() => {
    if (adRef.current) {
      // Placeholder logic for external ad script initialization
      // Example: const script = document.createElement('script'); ...
    }
  }, []);

  if (type === 'sidebar') {
    return (
      <div className={`mt-6 p-4 glass rounded-2xl border border-blue-500/10 relative overflow-hidden group ${className}`}>
        <div className="absolute inset-0 shimmer opacity-10 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.2em]">Sponsored Node</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
        <div 
          ref={adRef}
          className="w-full aspect-[4/3] bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden"
        >
          {/* ADSATERA SCRIPT GOES HERE */}
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">
              External Link<br/>Encrypted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-square glass rounded-[32px] overflow-hidden border border-blue-500/10 flex flex-col p-6 relative group ${className}`}>
      <div className="absolute inset-0 shimmer opacity-5 pointer-events-none"></div>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Network Support</h4>
          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Sponsored Synthesis</p>
        </div>
        <span className="px-2 py-1 glass rounded-lg text-[7px] font-black text-blue-400 border border-blue-500/20">AD</span>
      </div>
      
      <div 
        ref={adRef}
        className="flex-1 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative"
      >
        {/* ADSATERA SCRIPT GOES HERE */}
        <div className="text-center">
            <svg className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Connect to Network</p>
        </div>
      </div>

      <button className="mt-4 w-full py-2.5 glass-dark border border-white/5 rounded-xl text-[8px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all">
        Learn More
      </button>
    </div>
  );
};

export default AdSlot;
