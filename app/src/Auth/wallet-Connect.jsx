import React, { useEffect } from 'react'
import { Shield, Wallet, Loader2, LogOut, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { monadTestnet } from '../../waqmi.config'

const ConnectWalletPage = () => {
  const navigate = useNavigate()

  const { address, isConnected } = useAccount()
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const MONAD_TESTNET_ID = monadTestnet.id
  const isWrongNetwork = isConnected && chainId !== MONAD_TESTNET_ID

  // ==============================
  // AUTO-NAVIGATE IF CORRECT NETWORK
  // ==============================

  useEffect(() => {
    if (isConnected && chainId === MONAD_TESTNET_ID) {
      console.log('✅ Wallet connected on Monad Testnet, navigating to game')
      navigate('/gameStart')
    }
  }, [isConnected, chainId, navigate])

  // ==============================
  // HANDLERS
  // ==============================

  const handleSwitchToMonad = async () => {
    try {
      await switchChain({ chainId: MONAD_TESTNET_ID })
    } catch (err) {
      console.error('❌ Failed to switch network:', err)
    }
  }

  const handleConnect = async (connector) => {
    try {
      await connect({ connector })
    } catch (err) {
      console.error('❌ Wallet connect error:', err)
    }
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-black font-mono">

      <div className="w-full max-w-md bg-gray-950/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-xl">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-900/40 border border-purple-500/30 mb-4">
            <Shield className="w-7 h-7 text-purple-400" />
          </div>

          <h2 className="text-xl text-white font-bold">
            Connect Wallet
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            Link your wallet to access DeadDrop
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-200 text-sm">{error.message}</span>
          </div>
        )}

        {/* WRONG NETWORK WARNING */}
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

        {/* CONNECTED STATE */}
        {isConnected && !isWrongNetwork ? (
          <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30">

            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="text-emerald-400 w-5 h-5" />

              <span className="text-xs text-emerald-400 font-bold uppercase">
                Wallet Connected
              </span>
            </div>

            <p className="text-sm text-slate-300 font-mono truncate mb-4">
              {address}
            </p>

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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </div>
        ) : (

          // DISCONNECTED STATE
          <div className="space-y-3">

            {connectors.map((connector) => (
              <button
                key={connector.id ?? connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={status === 'pending'}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-sm">
                    {connector.name}
                  </span>
                </div>

                {status === 'pending' ? (
                  <Loader2 className="animate-spin w-4 h-4 text-purple-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}

export default ConnectWalletPage
