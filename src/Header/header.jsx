import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onAuthStateChange, logoutUser } from '../../src/Supabase/userAuth'
import {
  Wallet,
  LogOut,
  User,
  ShieldCheck,
  Fingerprint
} from 'lucide-react'

// 🟣 Wagmi imports
import { useAccount, useDisconnect } from 'wagmi'

function Header() {
  const navigate = useNavigate()

  // 🔐 Auth state
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  // 🟣 Wallet state
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // 🔁 Auth listener
  useEffect(() => {
    const { data } = onAuthStateChange((user) => {
      setLoggedIn(!!user)
      // Get username from user metadata
      if (user && user.user_metadata && user.user_metadata.username) {
        setUsername(user.user_metadata.username)
      } else {
        setUsername('')
      }
    })
    
    // Return cleanup function
    return () => {
      if (data && typeof data.subscription === 'function') {
        data.subscription()
      } else if (typeof data === 'function') {
        data()
      }
    }
  }, [])

  // ✅ Combined auth state
  const isAppLoggedIn = loggedIn || isConnected

  // 🧾 Display name priority: Auth → Wallet
  const displayName = username
    ? username
    : isConnected && address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : ''

  // 👉 Login / Game route
  const handleAuthClick = () => {
    if (isAppLoggedIn) {
      navigate('/gameStart')
    } else {
      navigate('/auth')
    }
  }

  // 🔌 Connect wallet route
  const handleConnectWalletRoute = () => {
    navigate('/connect-wallet')
  }

  // 🚪 Logout (Auth + Wallet)
  const handleLogout = async () => {
    try {
      if (auth.user()) await logoutUser()
      if (isConnected) disconnect()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-xl border-b border-purple-500/20 shadow-lg font-mono">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">

        {/* 🧠 Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="bg-purple-900/30 p-2 rounded-lg border border-purple-500/30 group-hover:border-purple-500/80 transition-all">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tighter">
            MYSTERY<span className="text-purple-500">.AI</span>
          </h1>
        </div>

        {/* 👉 Right Controls */}
        <div className="flex items-center gap-3 md:gap-4">

          {/* 🟢 User Badge */}
          {isAppLoggedIn && displayName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-full border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-slate-300 font-bold tracking-widest uppercase flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-slate-500" />
                DET. {displayName}
              </span>
            </div>
          )}

          {/* 🔌 Connect Wallet */}
          {!isConnected && (
            <button
              onClick={handleConnectWalletRoute}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-all text-white text-xs md:text-sm font-bold uppercase tracking-wide shadow-[0_0_15px_-5px_rgba(168,85,247,0.5)] border border-purple-400/20 active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}

          {/* 🔐 Login / Disconnect */}
          {isAppLoggedIn ? (
            <button
              onClick={handleLogout}
              className="group p-2 md:px-4 md:py-2 bg-slate-900 hover:bg-red-900/20 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all text-slate-400 hover:text-red-400 flex items-center gap-2 active:scale-95"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                Disconnect
              </span>
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all text-white text-xs md:text-sm font-bold uppercase tracking-wide active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header