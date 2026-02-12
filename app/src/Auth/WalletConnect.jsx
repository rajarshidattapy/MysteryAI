// src/Auth/WalletConnect.jsx
import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, Loader2, LogOut, CheckCircle2, ChevronRight } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async (connector) => {
    try {
      await connect({ connector });
    } catch (err) {
      console.error('❌ Wallet connect error:', err);
    }
  };

  // --- CONNECTED STATE (The "ID Card" Look) ---
  if (isConnected) {
    return (
      <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">
              Link Established
            </p>
            <p className="text-sm text-slate-300 font-mono font-medium truncate w-[200px] opacity-80">
              {address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            console.log('🔌 Disconnecting wallet');
            disconnect();
          }}
          className="w-full group flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
            Terminate Session
          </span>
        </button>
      </div>
    );
  }

  // --- DISCONNECTED STATE (The "Selector" Look) ---
  return (
    <div className="mt-4 space-y-3">
      {connectors.map((connector) => {
        const isPending = status === 'pending';

        return (
          <button
            key={connector.id ?? connector.uid}
            type="button"
            onClick={() => handleConnect(connector)}
            disabled={isPending}
            className="group relative w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-purple-500/50 rounded-xl transition-all duration-300 overflow-hidden"
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

            <div className="flex items-center gap-3 relative z-10">
              {/* Icon Placeholder or Generic Wallet Icon */}
              <div className="p-2 rounded-lg bg-black/40 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                <Wallet className="w-5 h-5 text-slate-300 group-hover:text-purple-300" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-semibold text-white group-hover:text-purple-100 transition-colors">
                  {connector.name}
                </span>
                {!connector.ready && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                    Not Installed
                  </span>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="relative z-10">
              {isPending ? (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              )}
            </div>
          </button>
        );
      })}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-center">
          <p className="text-xs text-red-300 font-mono">
            Error: {error.message}
          </p>
        </div>
      )}
    </div>
  );
}