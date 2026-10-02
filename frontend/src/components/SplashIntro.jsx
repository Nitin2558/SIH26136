import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const SplashIntro = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 transition-opacity duration-500 selection:bg-blue-600 selection:text-white ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 z-10"
      >
        <span>Skip</span>
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Pure Centered Logo Image with Glowing Rectangle Border */}
      <div className="relative max-w-md w-full animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center">
        
        {/* The Glowing Rectangle Border wrapping the original logo image directly */}
        <div className="glowing-logo-border rounded-3xl overflow-hidden shadow-2xl p-0.5 bg-slate-950">
          <img 
            src="/logo.jpg" 
            alt="Samadhan Setu" 
            className="w-80 sm:w-96 h-auto object-contain rounded-2.5xl block"
          />
        </div>

      </div>

    </div>
  );
};
