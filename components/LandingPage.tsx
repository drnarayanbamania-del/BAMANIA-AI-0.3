
import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const SparkleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2 animate-pulse whitespace-nowrap">
            <SparkleIcon className="w-12 h-12 text-blue-500 logo-glow flex-shrink-0" />
            <span className="text-xl font-bold tracking-[0.2em] logo-gradient uppercase">Bamania AI</span>
            <SparkleIcon className="w-12 h-12 text-blue-500 logo-glow flex-shrink-0" />
          </div>
          <div className="mb-6 whitespace-nowrap">
            <span className="text-[10px] font-mono font-bold tracking-[0.5em] text-gray-500 uppercase">EST. ID: SATERA</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-none">
            Your Creative <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 logo-glow">Universe</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Harness the power of Bamania AI to transform your wildest thoughts into stunning visual masterpieces.
          </p>
          <button 
            onClick={onEnter}
            className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-500/20 flex items-center gap-3 border border-blue-100"
          >
            Launch Bamania AI
            <SparkleIcon className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-6 md:px-12 bg-black/40">
        <h2 className="text-4xl font-bold mb-16 text-center">Featured Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { id: 1, url: 'https://picsum.photos/seed/cyberpunk/800/800', title: 'Cyberpunk Metropolis' },
            { id: 2, url: 'https://picsum.photos/seed/forest/800/800', title: 'Etherial Rainforest' },
            { id: 3, url: 'https://picsum.photos/seed/space/800/800', title: 'Deep Space Nebula' },
            { id: 4, url: 'https://picsum.photos/seed/portrait/800/800', title: 'Digital Portraiture' },
            { id: 5, url: 'https://picsum.photos/seed/abstract/800/800', title: 'Abstract Geometry' },
            { id: 6, url: 'https://picsum.photos/seed/future/800/800', title: 'Future Cityscape' },
          ].map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl glass aspect-square">
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
                <p className="text-white font-medium text-lg">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog/Information Section */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-center">The Future of Creative AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="glass p-8 rounded-3xl">
            <span className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 block">Innovation</span>
            <h3 className="text-2xl font-bold mb-4">Prompt Engineering 2.0</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Learn how "Magic Enhance" in Bamania AI utilizes large language models to transform simple text into complex scene descriptions.
            </p>
            <a href="#" className="text-white underline font-medium">Read Article</a>
          </div>
          <div className="glass p-8 rounded-3xl">
            <span className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-4 block">Technology</span>
            <h3 className="text-2xl font-bold mb-4">The Latent Space</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Discover how Bamania AI opens up billions of creative possibilities across different models and artistic styles.
            </p>
            <a href="#" className="text-white underline font-medium">Learn More</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-4 whitespace-nowrap">
          <SparkleIcon className="w-5 h-5 text-blue-500 logo-glow flex-shrink-0" />
          <span className="font-bold logo-gradient">BAMANIA AI</span>
        </div>
        <div className="mb-4 whitespace-nowrap">
          <span className="text-[10px] font-mono tracking-widest text-gray-600 uppercase">ESTABLISHED | ID: SATERA</span>
        </div>
        <p>&copy; 2024 Bamania AI. Powered by Gemini & Pollinations.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
