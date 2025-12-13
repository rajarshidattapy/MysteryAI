// src/Stats/UserStats.jsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getCurrentUser } from '../Supabase/auth.js';
import { supabase } from '../Supabase/supabaseClient.js';
import { History, Clock, Calendar, CheckCircle, XCircle, FileClock, Activity } from 'lucide-react';

const UserStats = () => {
  const [gameStats, setGameStats] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoading(true);


      let userId = null;
      let displayName = '';

      // Get Supabase user
      const { data: userSession } = await getCurrentUser();
      const user = userSession?.user;

      if (user) {
        userId = user.id;
        displayName = user.user_metadata?.username || user.email || '';
        setUsername(displayName);
      } else if (isConnected && address) {
        userId = `wallet:${address.toLowerCase()}`;
        setUsername(`${address.slice(0, 6)}...${address.slice(-4)}`);
      } else {
        setLoading(false);
        return;
      }

      try {
        // Query userGames from Supabase
        let { data: games, error } = await supabase
          .from('userGames')
          .select('*')
          .eq('userId', userId)
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Convert timestamp to Date
        games = (games || []).map((g) => ({
          ...g,
          timestamp: g.timestamp ? new Date(g.timestamp) : new Date(),
        }));
        setGameStats(games);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      setLoading(false);
    };

    fetchUserStats();
  }, [address, isConnected]);

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--:--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateAverage = () => {
    if (gameStats.length === 0) return null;
    const totalTime = gameStats.reduce(
      (sum, game) => sum + (game.timeTaken || 0),
      0
    );
    return Math.floor(totalTime / gameStats.length);
  };

  const averageTime = calculateAverage();

  if (loading) {
    return (
        <div className="h-full flex items-center justify-center p-8 text-purple-400">
            <Activity className="w-6 h-6 animate-pulse mr-2" />
            <span className="text-xs font-mono uppercase tracking-widest">Accessing Archives...</span>
        </div>
    );
  }

  if (gameStats.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-700 rounded-lg">
        <FileClock className="w-10 h-10 text-slate-600 mb-3" />
        <h3 className="text-slate-300 font-bold mb-1">No Case History</h3>
        <p className="text-slate-500 text-xs max-w-[200px]">
          Your dossier is empty, detective. Solve a mystery to build your record.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        {/* Header Section with Username & Avg Time */}
        <div className="flex justify-between items-end mb-4 pb-4 border-b border-white/5">
            <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Operative</p>
                <div className="text-white font-mono font-bold text-lg leading-none truncate max-w-[150px]">
                    {username}
                </div>
            </div>
            
            {averageTime !== null && (
                <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> Avg. Solve
                    </p>
                    <div className="font-mono text-purple-400 font-bold text-lg leading-none">
                        {formatTime(averageTime)}
                    </div>
                </div>
            )}
        </div>

        {/* Table List */}
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] uppercase text-slate-500 tracking-wider border-b border-slate-800">
                        <th className="pb-2 font-semibold">Case Title</th>
                        <th className="pb-2 font-semibold text-center">Status</th>
                        <th className="pb-2 font-semibold text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {gameStats.map((game) => (
                        <tr key={game.id} className="group border-b border-slate-800/50 last:border-0 hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-2 align-middle">
                                <div className="font-medium text-slate-300 group-hover:text-white transition-colors truncate max-w-[140px]">
                                    {game.caseTitle || 'Unidentified Case'}
                                </div>
                                <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(game.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </td>
                            
                            <td className="py-3 px-2 text-center align-middle">
                                {game.solved ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                        <CheckCircle className="w-3 h-3" />
                                        SOLVED
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                        <XCircle className="w-3 h-3" />
                                        COLD
                                    </span>
                                )}
                            </td>
                            
                            <td className="py-3 pl-2 text-right align-middle font-mono text-slate-400 group-hover:text-purple-300">
                                {formatTime(game.timeTaken)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default UserStats;