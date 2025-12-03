// src/Header/header.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChange, logoutUser } from '../../Firebase/userAuth';

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
      console.log('Checking for wallets...');
      console.log('window.ethereum:', window.ethereum);
      console.log('window.ethereum?.isMetaMask:', window.ethereum?.isMetaMask);
      console.log('window.phantom:', window.phantom);
      
      if (window.ethereum?.isMetaMask) {
        wallets.push({ name: 'MetaMask', id: 'metamask' });
      }
      if (window.phantom?.ethereum) {
        wallets.push({ name: 'Phantom', id: 'phantom' });
      }
      if (window.ethereum && !window.ethereum.isMetaMask && !window.phantom) {
        wallets.push({ name: 'Browser Wallet', id: 'injected' });
      }
    }
    
    console.log('Available wallets:', wallets);
    console.log('Wagmi connectors:', connectors);
    setAvailableWallets(wallets);
  }, [connectors]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setLoggedIn(!!user);
      setUsername(user ? user.displayName : '');
    });
    
    return () => unsubscribe();
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

  // ✅ App considers user logged in if Firebase OR wallet is connected
  const isAppLoggedIn = loggedIn || isConnected;

  // Choose display name:
  // Prefer Firebase username, otherwise short wallet address
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
      // Logout from Firebase (if logged in)
      if (auth.currentUser) {
        await logoutUser();
      }

      // Disconnect wallet (if connected)
      if (isConnected) {
        disconnect();
      }
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      navigate('/');
    }
  };

  const handleWalletConnect = () => {
    try {
      // Use the first available connector (injected)
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
        setShowWalletMenu(false);
        // Navigate to game if not already logged in with Firebase
        if (!loggedIn) {
          navigate('/gameStart');
        }
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-purple-800 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl font-bold text-purple-400 cursor-pointer"
        >
          MysteryAI
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {isAppLoggedIn && displayName && (
          <span className="text-purple-300">
            Welcome <span className="font-semibold">{displayName}</span>
          </span>
        )}
        
        {/* Wallet Connect Button */}
        {!isConnected && (
          <div className="relative" ref={walletMenuRef}>
            <button 
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white"
            >
              Connect Wallet
            </button>
            
            {showWalletMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-purple-700 rounded-md shadow-xl z-50">
                <div className="p-2">
                  {availableWallets.length > 0 ? (
                    availableWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={handleWalletConnect}
                        className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 rounded-md transition-colors"
                      >
                        {wallet.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      No wallet detected. Please install MetaMask or Phantom.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {isAppLoggedIn ? (
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors text-white"
            >
              {isConnected ? 'Disconnect' : 'Logout'}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAuthClick}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
