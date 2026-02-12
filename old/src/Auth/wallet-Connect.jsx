import React from 'react';
import { Shield, ArrowRight } from 'lucide-react'; // Added ArrowRight
import { useNavigate } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';

const ConnectWalletPage = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  // Auto-redirect after wallet connect
  React.useEffect(() => {
    if (isConnected) {
      navigate('/gameStart');
    }
  }, [isConnected, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-black font-mono overflow-hidden selection:bg-purple-500/30">
      
      {/* --- CSS for Custom Animations --- */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px 0px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 30px 5px rgba(168, 85, 247, 0.6); }
        }
        .animate-blob { animation: float 10s infinite ease-in-out; }
        .animate-blob-delay { animation: float 12s infinite ease-in-out reverse; }
        .glow-icon { animation: pulse-glow 3s infinite; }
      `}</style>

      {/* --- Dynamic Background Layer --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-overlay" />
        
        {/* Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: 'linear-gradient(#4c1d95 1px, transparent 1px), linear-gradient(90deg, #4c1d95 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-blob-delay mix-blend-screen" />
      </div>

      {/* --- Main Content Card --- */}
      <div className="w-full max-w-md relative z-10 group">
        
        {/* Card Border Gradient Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        
        {/* Glass Card Container */}
        <div className="relative bg-gray-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 ring-1 ring-white/5">
          
          <div className="text-center mb-8">
            {/* Icon Container */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/30 mb-6 glow-icon transform transition-transform hover:scale-105 duration-300">
              <Shield className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
            </div>
            
            <h2 className="text-2xl text-white font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Agent Authentication
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Connect your Web3 wallet to access the<br/>restricted neural interface.
            </p>
          </div>

          {/* Wallet UI (Imported Component) */}
          <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
            <WalletConnect />
          </div>

          {/* Divider */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-slate-500 uppercase tracking-[0.2em]">Or Access Via</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Secondary Action - IMPROVED STYLE */}
          <button
            onClick={() => navigate('/auth')}
            className="group w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-slate-400 hover:text-white border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-300 active:scale-[0.98]"
          >
            <span>Use Communication Link & Access Code</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletPage;