// src/Auth/Auth.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, AlertCircle, Shield, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { monadTestnet } from '../../waqmi.config'

const Auth = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const MONAD_TESTNET_ID = monadTestnet.id

  // Redirect to game if wallet is already connected and on correct network
  useEffect(() => {
    if (isConnected && chainId === MONAD_TESTNET_ID) {
      navigate('/gameStart')
    }
  }, [isConnected, chainId, navigate])
  // Handle network switching if on wrong chain
  const handleSwitchToMonad = async () => {
    try {
      await switchChain({ chainId: MONAD_TESTNET_ID })
    } catch (err) {
      console.error('❌ Failed to switch network:', err)
    }
  }

  // Handle wallet connection
  const handleConnect = async (connector) => {
    try {
      await connect({ connector })
    } catch (err) {
      console.error('❌ Wallet connect error:', err)
    }
  }

  const isWrongNetwork = isConnected && chainId !== MONAD_TESTNET_ID

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-black font-mono relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">

        {/* Card Header */}
        <div className="flex bg-slate-900/80 backdrop-blur-md rounded-t-2xl border border-purple-500/30 border-b-0 overflow-hidden">
          <div className="flex-1 py-4 text-sm font-bold tracking-wider text-center bg-purple-600 text-white">
            WALLET AUTHENTICATION
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-b-2xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/50 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl text-white font-bold tracking-tight">
              Connect to DeadDrop
            </h2>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
              Monad Testnet Required
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-200 text-sm">{error.message}</span>
            </div>
          )}

          {/* Wrong Network Warning */}
          {isWrongNetwork && (
            <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/50 rounded">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-200 text-sm font-bold">Wrong Network</p>
                  <p className="text-amber-300/80 text-xs mt-1">
                    Please switch to Monad Testnet to continue
                  </p>
                </div>
              </div>
              <button
                onClick={handleSwitchToMonad}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-bold text-white transition-all"
              >
                Switch to Monad Testnet
              </button>
            </div>
          )}

          {/* Connected State */}
          {isConnected && !isWrongNetwork ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                  <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    Wallet Connected
                  </p>
                  <p className="text-slate-300 text-xs font-mono mt-0.5">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/gameStart')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-bold text-white transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  Enter DeadDrop
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => disconnect()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : (
            // Disconnected State - Show Connectors
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id ?? connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={status === 'pending'}
                  className="w-full flex items-center justify-between px-4 py-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-900/50 transition-colors">
                      <Wallet className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-white text-sm font-semibold">
                      {connector.name}
                    </span>
                  </div>

                  {status === 'pending' ? (
                    <Loader2 className="animate-spin w-5 h-5 text-purple-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs">
              Wallet address is your only identity in DeadDrop
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

