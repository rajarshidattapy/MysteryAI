// src/Stats/WalletLeaderboard.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../Firebase/userAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Helper to truncate addresses like 0x1234...abcd
const shortAddr = (addr) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';

const WalletLeaderboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      try {
        const gamesRef = collection(db, 'userGames');
        // Get all games that have a walletAddress (we’ll filter client-side)
        const snap = await getDocs(gamesRef);

        const byWallet = new Map();

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.walletAddress) return;        // only wallet users
          if (!data.solved) return;               // only solved cases

          const key = data.walletAddress.toLowerCase();
          const existing = byWallet.get(key);

          const record = {
            walletAddress: data.walletAddress,
            bestTime: data.timeTaken ?? null,
            gamesPlayed: 1,
            wins: 1,
            hasSignedProof: !!data.walletProofSignature,
          };

          if (!existing) {
            byWallet.set(key, record);
          } else {
            byWallet.set(key, {
              walletAddress: data.walletAddress,
              bestTime: Math.min(
                existing.bestTime ?? Infinity,
                data.timeTaken ?? Infinity
              ),
              gamesPlayed: existing.gamesPlayed + 1,
              wins: existing.wins + 1,
              hasSignedProof: existing.hasSignedProof || !!data.walletProofSignature,
            });
          }
        });

        const arr = Array.from(byWallet.values())
          .filter((r) => r.bestTime !== null && Number.isFinite(r.bestTime))
          .sort((a, b) => a.bestTime - b.bestTime)  // fastest first
          .slice(0, 10);

        setRows(arr);
      } catch (err) {
        console.error('Error loading wallet leaderboard:', err);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6 text-center">
        <p className="text-gray-300">Loading wallet leaderboard...</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6 text-center">
        <h3 className="text-xl font-semibold text-purple-300 mb-2">
          Wallet Leaderboard
        </h3>
        <p className="text-gray-400">
          No wallet-based games yet. Connect your Monad wallet and solve a case!
        </p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const s = seconds ?? 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-purple-900 p-6 mb-6">
      <h3 className="text-xl font-semibold text-purple-300 mb-4">
        Wallet Leaderboard (Verified)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-800">
              <th className="text-left py-2 px-2 text-purple-200">Rank</th>
              <th className="text-left py-2 px-2 text-purple-200">Wallet</th>
              <th className="text-center py-2 px-2 text-purple-200">Best Time</th>
              <th className="text-center py-2 px-2 text-purple-200">Games</th>
              <th className="text-center py-2 px-2 text-purple-200">Proof</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.walletAddress} className="border-b border-slate-700">
                <td className="py-2 px-2 text-white">{idx + 1}</td>
                <td className="py-2 px-2 text-white font-mono">
                  {shortAddr(row.walletAddress)}
                </td>
                <td className="py-2 px-2 text-center text-white">
                  {formatTime(row.bestTime)}
                </td>
                <td className="py-2 px-2 text-center text-gray-300">
                  {row.gamesPlayed}
                </td>
                <td className="py-2 px-2 text-center">
                  {row.hasSignedProof ? (
                    <span className="text-emerald-400 text-xs font-semibold">
                      ✅ Signed
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-xs">
                      Unsigned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletLeaderboard;
