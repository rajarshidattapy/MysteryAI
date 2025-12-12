// src/Auth/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowRight, Loader2, Shield } from 'lucide-react';
import {
  registerUser,
  loginUser,
  onAuthStateChange,
  auth,
  logoutUser
} from '../../Firebase/userAuth';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in (Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        navigate('/gameStart');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Missing credentials. Please fill all fields.');
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
    } else {
      // Register logic
      if (password !== confirmPassword) {
        setError('Password mismatch detected.');
        setLoading(false);
        return;
      }

      if (!username.trim()) {
        setError('Agent alias (username) is required.');
        setLoading(false);
        return;
      }

      const { user, error } = await registerUser(email, password, username);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Optional: clear fields on toggle
    // setEmail(''); setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-black font-mono relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Card Header (Tabs) */}
        <div className="flex bg-slate-900/80 backdrop-blur-md rounded-t-2xl border border-purple-500/30 border-b-0 overflow-hidden">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold tracking-wider transition-colors ${isLogin ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            ACCESS TERMINAL
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold tracking-wider transition-colors ${!isLogin ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            NEW RECRUIT
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-b-2xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] p-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/30 border border-purple-500/50 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl text-white font-bold tracking-tight">
              {isLogin ? 'Identify Yourself' : 'Create Agent Profile'}
            </h2>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
              {isLogin ? 'Secure Connection Required' : 'Monad Clearance Pending'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-start gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field (Register Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-bold ml-1">CODENAME</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs text-purple-300 font-bold ml-1">COMMUNICATION LINK</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                  placeholder="agent@bureau.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs text-purple-300 font-bold ml-1">ACCESS CODE</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field (Register Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-purple-300 font-bold ml-1">VERIFY CODE</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg hover:shadow-purple-500/25 mt-6 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  {isLogin ? 'ESTABLISH LINK' : 'INITIALIZE AGENT'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
             <p className="text-slate-400 text-sm mb-2">
                {isLogin ? "No clearance yet?" : "Already an agent?"}
             </p>
             <button
              onClick={toggleAuthMode}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold hover:underline decoration-purple-500/50 underline-offset-4 transition-all"
            >
              {isLogin ? "Request Access (Sign Up)" : "Return to Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

// AuthUtils - Helper functions
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

export const logout = async (navigate) => {
  await logoutUser();
  navigate('/');
};

export const getUsername = () => {
  const user = auth.currentUser;
  return user ? user.displayName : '';
};