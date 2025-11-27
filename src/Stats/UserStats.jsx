// src/Stats/UserStats.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getUsername } from '../Auth/Auth';

const UserStats = () => {
  const [gameStats, setGameStats] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const name = await getUsername();
      setUsername(name);

      try {
        // Get user's recent games from Supabase
        const { data: games, error } = await supabase
          .from('games') // Assuming table name 'games' or 'user_games'
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedGames = games.map(game => ({
          id: game.id,
          caseTitle: game.case_title || "Mystery Case",
          solved: game.solved,
          timeTaken: game.time_taken,
          timestamp: new Date(game.created_at)
        }));

        setGameStats(formattedGames);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      setLoading(false);
    };

    fetchUserStats();
  }, []);

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "--:--:--";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate average solve time
  const calculateAverage = () => {
    if (gameStats.length === 0) return null;

    const totalTime = gameStats.reduce((sum, game) => sum + (game.timeTaken || 0), 0);
    return Math.floor(totalTime / gameStats.length);
  };

  const averageTime = calculateAverage();

  if (loading) {
    return <div className="text-center py-4">Loading stats...</div>;
  }

  if (gameStats.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6 text-center">
        <h3 className="text-xl font-semibold text-purple-300 mb-2">Your Game History</h3>
        <p className="text-gray-400">No games played yet. Generate a case to start playing!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6">
      <h3 className="text-xl font-semibold text-purple-300 mb-4">Your Recent Games</h3>

      {averageTime !== null && (
        <div className="mb-4 text-center">
          <span className="text-gray-300">Average Time: </span>
          <span className="font-bold text-white">{formatTime(averageTime)}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-800">
              <th className="text-left py-2 px-2 text-purple-200">Case</th>
              <th className="text-center py-2 px-2 text-purple-200">Result</th>
              <th className="text-right py-2 px-2 text-purple-200">Time</th>
              <th className="text-right py-2 px-2 text-purple-200">Date</th>
            </tr>
          </thead>
          <tbody>
            {gameStats.map((game, index) => (
              <tr key={index} className="border-b border-slate-700">
                <td className="py-2 px-2 text-white truncate max-w-[150px]">
                  {game.caseTitle}
                </td>
                <td className="py-2 px-2 text-center">
                  {game.solved ? (
                    <span className="text-green-400">Solved</span>
                  ) : (
                    <span className="text-red-400">Failed</span>
                  )}
                </td>
                <td className="py-2 px-2 text-right text-white">
                  {formatTime(game.timeTaken)}
                </td>
                <td className="py-2 px-2 text-right text-gray-400">
                  {game.timestamp.toLocaleDateString()}
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