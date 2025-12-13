// src/Header/header.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange, signOut } from '../Supabase/auth.js';
import { Wallet, LogOut, User, ChevronDown, Zap, ShieldCheck, Fingerprint } from 'lucide-react';

// 🟣 Wagmi imports
import { useAccount, useDisconnect, useConnect, useConnectors } from 'wagmi';

function Header() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);       // Firebase login
  const [username, setUsername] = useState('');
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const walletMenuRef = useRef(null);

  // 🟣 Wallet state from wagmi
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const connectors = useConnectors();

  // Detect available wallets
  useEffect(() => {
    const wallets = [];
    if (typeof window !== 'undefined') {
      if (window.ethereum?.isMetaMask) {
        wallets.push({ name: 'MetaMask', id: 'metamask', icon: '🦊' });
      }
      if (window.phantom?.ethereum) {
        wallets.push({ name: 'Phantom', id: 'phantom', icon: '👻' });
      }
      if (window.ethereum && !window.ethereum.isMetaMask && !window.phantom) {
        wallets.push({ name: 'Browser Wallet', id: 'injected', icon: '🌐' });
      }
    }
    setAvailableWallets(wallets);
  }, [connectors]);

  // Supabase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setLoggedIn(!!user);
      setUsername(user ? (user.user_metadata?.username || user.email) : '');
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
    };
    if (showWalletMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletMenu]);

  const isAppLoggedIn = loggedIn || isConnected;

  const displayName = username
    ? username
    : isConnected && address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : '';

  const handleAuthClick = () => {
    if (isAppLoggedIn) {
      navigate('/gameStart');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      // Supabase logout
      await signOut();
      if (isConnected) disconnect();
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      navigate('/');
    }
  };

  const handleWalletConnect = () => {
    try {
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
        setShowWalletMenu(false);
        if (!loggedIn) navigate('/gameStart');
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
    }
  };

  return (
    // FIX: Changed z-50 to z-40 so it sits BEHIND the modal (which should be z-50 or z-100)
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-xl border-b border-purple-500/20 shadow-lg font-mono transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">

        {/* Logo Section */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="bg-purple-900/30 p-2 rounded-lg border border-purple-500/30 group-hover:border-purple-500/80 group-hover:shadow-[0_0_15px_-5px_rgba(168,85,247,0.5)] transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tighter group-hover:text-purple-100 transition-colors">
            MYSTERY<span className="text-purple-500 group-hover:text-purple-400">.AI</span>
          </h1>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 md:gap-4">

          {/* User Badge */}
          {isAppLoggedIn && displayName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-full border border-slate-700 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] md:text-xs text-slate-300 font-bold tracking-widest uppercase flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-slate-500" />
                DET. {displayName}
              </span>
            </div>
          )}

          {/* Wallet Connect Dropdown */}
          {!isConnected && (
            <div className="relative" ref={walletMenuRef}>
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-all text-white text-xs md:text-sm font-bold uppercase tracking-wide shadow-[0_0_15px_-5px_rgba(168,85,247,0.5)] border border-purple-400/20 active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showWalletMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showWalletMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-950/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 px-3 py-2 font-bold bg-white/5">Select Interface</div>
                    {availableWallets.length > 0 ? (
                      availableWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={handleWalletConnect}
                          className="w-full flex items-center gap-3 px-3 py-3 text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent rounded-lg transition-all group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">{wallet.icon}</span>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-bold group-hover:text-purple-300">{wallet.name}</span>
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Initialize Connection</span>
                          </div>
                          <Zap className="w-3 h-3 ml-auto text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center">
                        <p className="text-slate-400 text-xs mb-2">No active wallet signals.</p>
                        <a href="https://metamask.io" target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wide border-b border-purple-500/30 hover:border-purple-400">Install MetaMask</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {isAppLoggedIn ? (
            <button
              onClick={handleLogout}
              className="group p-2 md:px-4 md:py-2 bg-slate-900 hover:bg-red-900/20 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all text-slate-400 hover:text-red-400 flex items-center gap-2 active:scale-95"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Disconnect</span>
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
  );
}

export default Header;