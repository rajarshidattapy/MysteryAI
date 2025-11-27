// src/Header/header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange, logoutUser } from '../../Firebase/userAuth';
import {
  getMonadWalletAddress,
  disconnectMonadWallet,
  shortenAddress
} from '../web3/monadWallet';

function Header() {
  const navigate = useNavigate();

  // Track Firebase user separately
  const [firebaseUser, setFirebaseUser] = useState(null);
  // Track wallet address
  const [walletAddress, setWalletAddress] = useState(getMonadWalletAddress());

  // Derived: logged in if either Firebase or wallet is present
  const loggedIn = !!firebaseUser || !!walletAddress;

  // Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user || null);

      // Also resync wallet state from localStorage
      const addr = getMonadWalletAddress();
      setWalletAddress(addr || null);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthClick = () => {
    if (loggedIn) {
      navigate('/gameStart');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    // If logged in with Firebase, log out
    if (firebaseUser) {
      await logoutUser();
      setFirebaseUser(null);
    }

    // If logged in with wallet, disconnect
    if (walletAddress) {
      disconnectMonadWallet();
      setWalletAddress(null);
    }

    navigate('/');
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
        {/* Greeting / status */}
        {firebaseUser && (
          <span className="text-purple-300">
            Welcome <span className="font-semibold">{firebaseUser.displayName || 'Detective'}</span>
          </span>
        )}

        {!firebaseUser && walletAddress && (
          <span className="text-purple-300">
            Connected:{' '}
            <span className="font-semibold">
              {shortenAddress(walletAddress)}
            </span>
          </span>
        )}

        {/* Buttons */}
        {loggedIn ? (
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors text-white"
            >
              {firebaseUser ? 'Logout' : 'Disconnect Wallet'}
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
