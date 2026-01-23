import React, { useEffect, useState } from 'react'
import { Shield, Wallet, Loader2, LogOut, CheckCircle2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { supabase } from '../Supabase/supabaseClient' // adjust path if needed

const ConnectWalletPage = () => {
  const navigate = useNavigate()

  const { address, isConnected } = useAccount()
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  const [saving, setSaving] = useState(false)

  // ==============================
  // SAVE WALLET AFTER CONNECT
  // ==============================

  useEffect(() => {
    if (!isConnected || !address) return

    const saveWallet = async () => {
      try {
        setSaving(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error('❌ No Supabase user session found')
          return
        }

        console.log('👤 Supabase User ID:', user.id)
        console.log('🔗 Wallet Address:', address)

        // Upsert wallet into user_stats
        const { error } = await supabase
          .from('user_stats')
          .upsert({
            user_id: user.id,
            wallet_address: address,
          })

        if (error) {
          console.error('❌ Failed saving wallet:', error)
          return
        }

        console.log('✅ Wallet linked successfully')

        navigate('/gameStart')
      } catch (err) {
        console.error('❌ Wallet save error:', err)
      } finally {
        setSaving(false)
      }
    }

    saveWallet()
  }, [isConnected, address, navigate])

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
            Link your Web3 identity to your account
          </p>
        </div>

        {/* CONNECTED STATE */}
        {isConnected ? (
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

            {saving && (
              <div className="flex items-center gap-2 text-purple-400 text-sm mb-3">
                <Loader2 className="animate-spin w-4 h-4" />
                Saving wallet...
              </div>
            )}

            <button
              onClick={() => disconnect()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        ) : (

          // DISCONNECTED STATE
          <div className="space-y-3">

            {connectors.map((connector) => (
              <button
                key={connector.id ?? connector.uid}
                onClick={() => connect({ connector })}
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

            {error && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
                {error.message}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default ConnectWalletPage
