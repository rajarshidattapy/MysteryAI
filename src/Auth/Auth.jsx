// src/Auth/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  registerUser, 
  loginUser, 
  onAuthStateChange, 
  auth, 
  logoutUser 
} from '../../Firebase/userAuth';
import {
  connectMonadWallet,
  getMonadWalletAddress,
  disconnectMonadWallet,
  shortenAddress,
  detectWalletProviders
} from '../web3/monadWallet';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(getMonadWalletAddress());
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [walletConnecting, setWalletConnecting] = useState(false);

 // Open modal and detect wallets
const openWalletModal = () => {
  setError('');

  const wallets = detectWalletProviders();

  if (!wallets.length) {
    setError('No EVM wallet found. Please install MetaMask / Phantom / Rabby, etc.');
    return;
  }

  setAvailableWallets(wallets);
  setWalletModalOpen(true);
};

// Called when user picks a wallet from the modal
const handleWalletChoice = async (walletId) => {
  if (walletConnecting) return; // prevents double clicks

  setWalletConnecting(true);
  setLoading(true);
  setError('');

  try {
    const address = await connectMonadWallet(walletId);
    setWalletAddress(address);
    setWalletModalOpen(false);
    navigate('/gameStart');
  } catch (err) {
    if (err.code === -32002) {
      setError("A wallet request is already open. Please check your wallet popup.");
    } else {
      setError(err.message || "Failed to connect wallet");
    }
  } finally {
    setLoading(false);
    setWalletConnecting(false);
  }
};





  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        navigate('/gameStart');
      }
    });

      


    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  // If a wallet address already exists (connected before), redirect to game
  useEffect(() => {
    if (walletAddress) {
      navigate('/gameStart');
    }
  }, [walletAddress, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isLogin) {
      // Login logic
      const { user, error } = await loginUser(email, password);
      
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      
      // Success - navigation handled by useEffect with onAuthStateChange
    } else {
      // Register logic
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      const { user, error } = await registerUser(email, password, username);
      
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      
      // Success - navigation handled by useEffect with onAuthStateChange
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 font-mono">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-purple-900">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-300">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

                {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="px-3 text-xs text-slate-400 uppercase tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Monad wallet login */}
        <div className="mt-4">
          <button
  type="button"
  onClick={() => {
    if (!walletAddress) {
      openWalletModal();
    }
    // If walletAddress exists, we do nothing here:
    // the useEffect will already redirect automatically.
  }}
  disabled={loading || walletConnecting}
  className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full ${
    loading || walletConnecting ? 'opacity-70 cursor-not-allowed' : ''
  }`}
>
  {walletAddress
    ? `Continue with Monad Wallet (${shortenAddress(walletAddress)})`
    : 'Sign in with Monad Wallet'}
</button>

        </div>


        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-purple-400 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>

            {/* Wallet selection modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 border border-purple-700 rounded-lg p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setWalletModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold text-purple-200 mb-4 text-center">
              Choose a wallet
            </h3>

            <div className="space-y-3">
              {availableWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWalletChoice(w.id)}
                  className="w-full px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm text-left"
                  disabled={loading}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-400 text-center">
              Make sure your wallet is configured for the Monad network.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Auth;

// AuthUtils - Helper functions to use throughout the app
// Now: consider BOTH Firebase user and Monad wallet
export const isAuthenticated = () => {
  const hasFirebaseUser = !!auth.currentUser;
  const hasWalletUser = !!getMonadWalletAddress();
  return hasFirebaseUser || hasWalletUser;
};

export const logout = async (navigate) => {
  // Try Firebase logout (if you’re logged in with wallet only, this just does nothing)
  await logoutUser();
  // Also clear wallet session
  disconnectMonadWallet();
  navigate('/');
};

// Still fine for Firebase users. For wallet-only users this will just be empty.
export const getUsername = () => {
  const user = auth.currentUser;
  return user ? user.displayName : '';
};
