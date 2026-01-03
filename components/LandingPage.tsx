
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnter: (id: string) => void;
}

const SparkleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedMockOtp, setGeneratedMockOtp] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setIsProcessing(true);
      // Simulate network latency for the Neural Link
      setTimeout(() => {
        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedMockOtp(mockCode);
        setStep('otp');
        setIsProcessing(false);
        setResendTimer(30);
        
        // Show simulated SMS notification
        setShowNotification(true);
        // Hide notification after 8 seconds
        setTimeout(() => setShowNotification(false), 8000);
        
        console.log(`[Bamania Auth] SMS SENT TO +91 ${phoneNumber}. CODE: ${mockCode}`);
      }, 1200);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    // Allow the generated code or the master key
    if (enteredOtp === generatedMockOtp || enteredOtp === '123456') {
      setIsProcessing(true);
      setShowNotification(false);
      setTimeout(() => {
        onEnter(phoneNumber);
      }, 1000);
    } else {
      alert('Neural Mismatch: The entered OTP is incorrect.');
    }
  };

  const showcaseImages = [
    'https://images.pollinations.ai/prompt/cyberpunk%20cityscape%20neon%20reflections?width=800&height=800&nologo=true&seed=2',
    'https://images.pollinations.ai/prompt/ethereal%20forest%20glowing%20plants%20fantasy?width=800&height=800&nologo=true&seed=3',
    'https://images.pollinations.ai/prompt/majestic%20elephant%20intricate%20armor%20cinematic?width=800&height=800&nologo=true&seed=1',
  ];

  return (
    <div className="min-h-screen w-full bg-[#030712] flex overflow-hidden font-sans">
      {/* Simulated SMS Notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in slide-in-from-top-10 duration-500">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural SMS</span>
                <span className="text-[9px] text-gray-500 font-bold">JUST NOW</span>
              </div>
              <p className="text-white text-sm font-medium leading-relaxed">
                Your Bamania AI verification code is: <span className="text-blue-400 font-black tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">{generatedMockOtp}</span>. Valid for 5 minutes.
              </p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-24 h-screen border-r border-white/5 flex-col items-center py-6 gap-6 overflow-y-auto flex-shrink-0 bg-black/40">
        <div className="opacity-20 rotate-90 whitespace-nowrap mb-8">
           <span className="text-[10px] font-black tracking-[0.5em] uppercase text-blue-400">Archival Nodes</span>
        </div>
        {showcaseImages.map((url, idx) => (
          <div key={idx} className="w-14 h-14 rounded-2xl overflow-hidden glass border border-white/5 flex-shrink-0">
            <img src={url} className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
          </div>
        ))}
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl glass p-12 md:p-24 rounded-[50px] border border-white/10 shadow-2xl flex flex-col items-center text-center">
          <div className="mb-12">
            <div className="relative mb-6 flex justify-center">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150"></div>
              <SparkleIcon className="w-24 h-24 text-blue-500 logo-glow relative z-10 shrink-0" />
            </div>
            <h2 className="text-3xl font-black tracking-[0.6em] logo-gradient uppercase mb-2 whitespace-nowrap">Bamania AI</h2>
            <p className="text-[11px] font-mono font-bold tracking-[0.5em] text-blue-400/60 uppercase">Neural Synthesis Engine v2.5</p>
          </div>

          <h1 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter leading-tight text-white max-w-2xl">
            {step === 'phone' ? 'Verify your ' : 'Finalize '}
            <span className="text-blue-500 logo-glow">{step === 'phone' ? 'Identity' : 'Sync'}</span>
          </h1>

          <div className="w-full max-w-md">
            {step === 'phone' ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 font-black tracking-widest text-sm border-r border-white/10 pr-4">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="MOBILE NUMBER" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-20 pr-8 py-5 text-xl text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all duration-500 tracking-[0.2em] font-black"
                    required
                    disabled={isProcessing}
                    autoFocus
                  />
                  <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700"></div>
                </div>
                
                <button 
                  type="submit"
                  disabled={phoneNumber.length < 10 || isProcessing}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group shadow-2xl disabled:opacity-30 disabled:grayscale"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isProcessing ? 'SYNCHRONIZING...' : 'REQUEST OTP'}
                    {!isProcessing && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-16 md:w-14 md:h-20 bg-black/60 border border-white/10 rounded-xl text-center text-2xl font-black text-blue-500 outline-none focus:border-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      required
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    type="submit"
                    disabled={otp.some(d => !d) || isProcessing}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group shadow-2xl disabled:opacity-30"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isProcessing ? 'ESTABLISHING LINK...' : 'VERIFY & ENTER'}
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-between px-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setShowNotification(false);
                      }}
                      className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      Change Number
                    </button>
                    <button 
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={() => {
                        setResendTimer(30);
                        const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedMockOtp(mockCode);
                        setShowNotification(true);
                        setTimeout(() => setShowNotification(false), 8000);
                      }}
                      className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors disabled:text-gray-600"
                    >
                      {resendTimer > 0 ? `RESEND IN ${resendTimer}S` : 'RESEND CODE'}
                    </button>
                  </div>
                </div>

                <div className="p-4 glass rounded-xl border-blue-500/20 bg-blue-500/5">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] leading-relaxed">
                    Identity: <span className="text-white">+91 {phoneNumber}</span><br/>
                    <span className="text-gray-500 mt-1 block">Check the notification at the top of your screen for the code.</span>
                  </p>
                </div>
              </form>
            )}
          </div>
          
          <div className="mt-16 opacity-30">
            <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-gray-500">Every unique number grants 8 Daily Neural Credits</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
