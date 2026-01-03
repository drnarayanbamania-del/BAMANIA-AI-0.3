
import React from 'react';

interface NeuralPlaceholderProps {
  variant: 'sidebar' | 'main' | 'archive';
  title?: string;
  description?: string;
}

const NeuralPlaceholder: React.FC<NeuralPlaceholderProps> = ({ variant, title, description }) => {
  const isSidebar = variant === 'sidebar';
  
  return (
    <div className={`relative w-full flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-1000 group ${isSidebar ? 'p-8 aspect-square' : 'p-20 min-h-[400px]'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="neural-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#neural-grad)" className="animate-pulse" />
        </svg>
      </div>

      {/* Neural Core Icon */}
      <div className={`relative z-10 glass rounded-[40px] flex items-center justify-center mb-10 shadow-3xl border border-white/10 animate-bounce-slow ${isSidebar ? 'w-16 h-16' : 'w-32 h-32'}`}>
        <svg 
          className={`${isSidebar ? 'w-8 h-8' : 'w-16 h-16'} text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
        
        {/* Animated Orbitals */}
        <div className="absolute inset-[-10px] border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-[-20px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 space-y-4 max-w-[280px]">
        {title && (
          <h4 className={`${isSidebar ? 'text-[11px]' : 'text-3xl'} font-black uppercase tracking-[0.4em] text-white`}>
            {title}
          </h4>
        )}
        {description && (
          <p className={`${isSidebar ? 'text-[10px]' : 'text-[12px]'} font-bold uppercase tracking-widest text-gray-600 leading-relaxed opacity-60`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default NeuralPlaceholder;
