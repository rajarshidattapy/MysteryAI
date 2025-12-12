// src/Stats/WalletLeaderboard.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../Firebase/userAuth';
import { collection, getDocs } from 'firebase/firestore';
import { Trophy, Medal, ShieldCheck, Timer, Hash } from 'lucide-react';

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

  const formatTime = (seconds) => {
    const s = seconds ?? 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  // Rank Color Logic
  const getRankStyle = (index) => {
    switch (index) {
        case 0: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"; // Gold
        case 1: return "text-slate-300 bg-slate-300/10 border-slate-300/20";   // Silver
        case 2: return "text-amber-600 bg-amber-600/10 border-amber-600/20";   // Bronze
        default: return "text-slate-500 bg-slate-800/50 border-transparent";
    }
  };

  if (loading) {
    return (
        <div className="h-full flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest animate-pulse">
            Syncing Global Records...
        </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Trophy className="w-8 h-8 mb-2 opacity-20" />
        <span className="text-xs">No records found. Be the first.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* List Header */}
      <div className="grid grid-cols-12 gap-2 pb-2 mb-2 border-b border-white/5 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Detective</div>
        <div className="col-span-3 text-right">Best Time</div>
        <div className="col-span-3 text-center">Verified</div>
      </div>

      {/* Rows */}
      <div className="overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        {rows.map((row, idx) => (
            <div key={row.walletAddress} className="grid grid-cols-12 gap-2 items-center py-2 px-1 hover:bg-white/5 rounded transition-colors group">
                
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                    <div className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold border ${getRankStyle(idx)}`}>
                        {idx + 1}
                    </div>
                </div>

                {/* Address */}
                <div className="col-span-5 font-mono text-xs text-slate-300 group-hover:text-white transition-colors">
                    {shortAddr(row.walletAddress)}
                    {idx === 0 && <Medal className="w-3 h-3 text-yellow-400 inline ml-2" />}
                </div>

                {/* Time */}
                <div className="col-span-3 text-right font-mono text-xs text-purple-400 font-medium">
                    {formatTime(row.bestTime)}
                </div>

                {/* Proof */}
                <div className="col-span-3 flex justify-center">
                    {row.hasSignedProof ? (
                        <div className="group/tooltip relative">
                             <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                    ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default WalletLeaderboard;