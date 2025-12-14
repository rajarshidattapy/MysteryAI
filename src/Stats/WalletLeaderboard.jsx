// src/Stats/WalletLeaderboard.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../src/Supabase/supabaseClient'
import { Trophy, Medal, ShieldCheck, Timer, Hash } from 'lucide-react'

// Helper to truncate addresses like 0x1234...abcd
const shortAddr = (addr) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

const WalletLeaderboard = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)

      try {
        const { data, error } = await supabase
          .from('user_games')
          .select('*')
          .eq('solved', true)
        
        if (error) {
          console.error("Error fetching leaderboard:", error)
          setLoading(false)
          return
        }

        const byWallet = new Map()

        data.forEach((item) => {
          if (!item.wallet_address) return // only wallet users
          if (!item.solved) return // only solved cases

          const key = item.wallet_address.toLowerCase()
          const existing = byWallet.get(key)

          const record = {
            wallet_address: item.wallet_address,
            best_time: item.time_taken ?? null,
            games_solved: 1,
            last_played: item.timestamp
          }

          if (existing) {
            // Merge with existing record
            byWallet.set(key, {
              ...existing,
              best_time: Math.min(existing.best_time, record.best_time),
              games_solved: existing.games_solved + 1,
              last_played: new Date(Math.max(new Date(existing.last_played), new Date(record.last_played)))
            })
          } else {
            byWallet.set(key, record)
          }
        })

        // Convert map to array and sort
        const sorted = Array.from(byWallet.values())
          .sort((a, b) => a.best_time - b.best_time)
          .slice(0, 10)

        setRows(sorted)
      } catch (err) {
        console.error("Error processing leaderboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 text-sm">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full">
      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-500 text-sm text-center">
            No solved cases yet.<br />Be the first to solve a mystery!
          </div>
        </div>
      ) : (
        rows.map((row, i) => (
          <div 
            key={row.wallet_address} 
            className="flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 rounded-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                i === 1 ? 'bg-slate-600/30 text-slate-400' : 
                i === 2 ? 'bg-amber-800/30 text-amber-600' : 
                'bg-slate-800 text-slate-500'
              }`}>
                {i + 1}
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-medium text-white flex items-center gap-1">
                  {shortAddr(row.wallet_address)}
                  {i < 3 && (
                    <Medal className={`w-3 h-3 ${
                      i === 0 ? 'text-yellow-400' : 
                      i === 1 ? 'text-slate-400' : 
                      'text-amber-600'
                    }`} />
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {row.games_solved} solved
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-sm font-mono text-purple-400 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {row.best_time}s
              </div>
              <div className="text-[10px] text-slate-500">
                {new Date(row.last_played).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default WalletLeaderboard