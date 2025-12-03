// src/Auth/WalletConnect.jsx
import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async (connector) => {
    try {
      //console.log('▶️ Trying to connect with:', connector.id, connector.name, 'ready=', connector.ready);
      await connect({ connector });
      //console.log('✅ connect() call finished for:', connector.id);
    } catch (err) {
      console.error('❌ Wallet connect error:', err);
    }
  };

  if (isConnected) {
    return (
      <div className="mt-4 p-4 rounded-lg bg-slate-700 border border-emerald-500">
        <p className="text-sm text-emerald-300 mb-2 break-all">
          Connected wallet:<br /> {address}
        </p>
        <button
          type="button"  
          onClick={() => {
            console.log('🔌 Disconnecting wallet');
            disconnect();
          }}
          className="w-full px-4 py-2 mt-2 bg-red-600 hover:bg-red-500 rounded-md text-white text-sm font-semibold"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-purple-200 mb-3 text-center">
        Or connect with Monad 
      </h3>

      {/* <p className="text-[10px] text-slate-400 text-center mb-2">
        wagmi status: <span className="font-mono">{status}</span>
      </p> */}

      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.id ?? connector.uid}
            type="button"  
            onClick={() => handleConnect(connector)}
            
            disabled={status === 'pending'}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 rounded-md text-white text-sm font-semibold border border-slate-600"
          >
            {connector.name}
            {!connector.ready && ' (not installed)'}
          </button>
        ))}
      </div>

      

      {error && (
        <p className="mt-3 text-xs text-red-400 text-center">
          {error.message}
        </p>
      )}
    </div>
  );
}
