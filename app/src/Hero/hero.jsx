// src/Hero/hero.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChange } from '../../src/Supabase/userAuth'
import { Search, HelpCircle, Fingerprint, Trophy, Skull, Wallet, ChevronRight } from 'lucide-react'

function Hero() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Update logged in status when auth state changes
    const subscription = onAuthStateChange((user) => {
      setLoggedIn(!!user)
    })

    // Return cleanup function
    return () => {
      // Handle both old and new Supabase subscription formats
      if (subscription?.data?.subscription?.unsubscribe) {
        subscription.data.subscription.unsubscribe()
      } else if (subscription?.subscription?.unsubscribe) {
        subscription.subscription.unsubscribe()
      } else if (typeof subscription === 'function') {
        subscription()
      }
    }
  }, [])

  const handlePlayGame = () => {
    if (loggedIn) {
      navigate('/gameStart')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 font-mono overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay for atmosphere and readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 via-purple-900/10 to-black/80"></div>

      {/* Grid Pattern Overlay (Tech feel) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">

        {/* Main Card */}
        <div className="w-full bg-black/70 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-[0_0_50px_-12px_rgba(168,85,247,0.25)] overflow-hidden">

          {/* Header Bar */}
          <div className="bg-purple-900/20 border-b border-purple-500/20 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-purple-400 text-xs tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span>Case File #8391-M</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
               <span>Powered by Monad</span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Title Section */}
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                WHO KILLED THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">ARCHITECT?</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Connect your wallet. Analyze the evidence. Submit your verdict on-chain to claim the Proof of Completion NFT.
              </p>
            </div>

            {/* Rules / Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg flex items-start space-x-4 hover:bg-purple-900/20 transition-colors">
                <Search className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-bold text-sm">Analyze Clues</h4>
                  <p className="text-slate-400 text-xs mt-1">Scour the scene for hidden digital footprints.</p>
                </div>
              </div>

              <div className="bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg flex items-start space-x-4 hover:bg-purple-900/20 transition-colors">
                <HelpCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-bold text-sm">Interrogate AI</h4>
                  <p className="text-slate-400 text-xs mt-1">Ask the suspects. Detect their lies.</p>
                </div>
              </div>

              <div className="bg-purple-900/10 border border-purple-500/10 p-4 rounded-lg flex items-start space-x-4 hover:bg-purple-900/20 transition-colors">
                <Skull className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-bold text-sm">Deduce the Killer</h4>
                  <p className="text-slate-400 text-xs mt-1">Time is ticking. Make your choice.</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/40 p-4 rounded-lg flex items-start space-x-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-all"></div>
                <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    Proof of Completion
                  </h4>
                  <p className="text-slate-300 text-xs mt-1">Solve correctly to mint your reward.</p>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                onClick={handlePlayGame}
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                {/* Button background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-white to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  {loggedIn ? <Fingerprint className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  {loggedIn ? 'ENTER CRIME SCENE' : 'CONNECT WALLET TO START'}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {!loggedIn && (
                <p className="text-xs text-slate-500 animate-pulse">
                  Monad Mainnet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero