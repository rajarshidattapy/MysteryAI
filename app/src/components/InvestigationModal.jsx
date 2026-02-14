import { useState } from "react";
import LifeMCQ from "./LifeMCQ";

const InvestigationModal = ({ onClose, onGameStart }) => {
  const [step, setStep] = useState("choice");
  const [loading, setLoading] = useState(false);

  const fakeConnect = (platform) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onGameStart();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] font-mono">
      {/* Cyberpunk Container */}
      <div className="relative bg-gray-950 border-2 border-cyan-500/30 p-1 shadow-[0_0_20px_rgba(6,182,212,0.2)] w-[90%] max-w-md overflow-hidden">
        
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

        <div className="bg-gray-900/90 p-6 border border-white/5">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-cyan-400">System_Access.exe</span>
            <button onClick={onClose} className="text-red-500 hover:text-red-400"> [X] </button>
          </div>

          {step === "choice" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase mb-6">
                Establish <span className="text-red-500">Neural</span> Link
              </h2>

              <button
                onClick={() => setStep("personal")}
                className="group relative w-full py-4 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 transition-all overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-purple-500 group-hover:w-full transition-all duration-300 opacity-20" />
                <span className="relative z-10 font-bold tracking-widest uppercase">Personal Data Extraction</span>
              </button>

              <button
                onClick={() => setStep("mcq")}
                className="group relative w-full py-4 bg-transparent border border-cyan-500/50 hover:bg-cyan-500/10 transition-all overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 group-hover:w-full transition-all duration-300 opacity-20" />
                <span className="relative z-10 font-bold tracking-widest uppercase">Psychological Profiling</span>
              </button>
            </div>
          )}

          {step === "personal" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 tracking-tighter">SELECT PROTOCOL</h2>
              
              <button
                onClick={() => fakeConnect('WA')}
                disabled={loading}
                className="w-full py-3 bg-green-900/20 border border-green-500 text-green-500 font-bold hover:bg-green-500 hover:text-black transition-all"
              >
                {loading ? ">_ LINKING..." : "CONNECT WHATSAPP"}
              </button>

              <button
                onClick={() => fakeConnect('TG')}
                disabled={loading}
                className="w-full py-3 bg-sky-900/20 border border-sky-400 text-sky-400 font-bold hover:bg-sky-400 hover:text-black transition-all"
              >
                {loading ? ">_ LINKING..." : "CONNECT TELEGRAM"}
              </button>
              
              <button onClick={() => setStep("choice")} className="w-full text-[10px] text-gray-500 mt-2 uppercase">Back to Main Menu</button>
            </div>
          )}

          {step === "mcq" && <LifeMCQ onFinish={onGameStart} />}

          <button
            onClick={onClose}
            className="mt-8 text-[10px] text-gray-600 w-full text-center uppercase hover:text-red-500 transition-colors"
          >
            — Terminate Connection —
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestigationModal;