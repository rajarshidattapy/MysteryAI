// src/Stats/UserStats.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../src/Supabase/supabaseClient'
import { auth } from '../../src/Supabase/userAuth'
import { Trophy, Timer, Hash, Target } from 'lucide-react'

const UserStats = () => {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    totalSolveTime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentUser = auth.user()
        if (!currentUser) return

        // Fetch user stats from Supabase
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()
        
        if (error) {
          console.error("Error fetching user stats:", error)
          // Initialize with default values if no stats exist
          setStats({
            gamesPlayed: 0,
            wins: 0,
            totalSolveTime: 0
          })
          return
        }
        
        if (data) {
          setStats({
            gamesPlayed: data.games_played || 0,
            wins: data.wins || 0,
            totalSolveTime: data.total_solve_time || 0
          })
        }
      } catch (err) {
        console.error("Error in fetchStats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_stats'
        },
        (payload) => {
          if (payload.new.user_id === auth.user()?.id) {
            setStats({
              gamesPlayed: payload.new.games_played || 0,
              wins: payload.new.wins || 0,
              totalSolveTime: payload.new.total_solve_time || 0
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0
  
  const avgTime = stats.wins > 0 
    ? Math.round(stats.totalSolveTime / stats.wins) 
    : 0

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-slate-800 transition-all">
        <div className="flex items-center gap-2 text-slate-400">
          <Hash className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Cases Attempted</span>
        </div>
        <div className="text-lg font-bold text-white">{stats.gamesPlayed}</div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-slate-800 transition-all">
        <div className="flex items-center gap-2 text-slate-400">
          <Trophy className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Cases Solved</span>
        </div>
        <div className="text-lg font-bold text-white">{stats.wins}</div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-slate-800 transition-all">
        <div className="flex items-center gap-2 text-slate-400">
          <Target className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Success Rate</span>
        </div>
        <div className="text-lg font-bold text-white">{winRate}%</div>
      </div>
      
      <div className="flex justify-between items-center p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg border border-slate-800 transition-all">
        <div className="flex items-center gap-2 text-slate-400">
          <Timer className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Avg. Solve Time</span>
        </div>
        <div className="text-lg font-bold text-white">{avgTime}s</div>
      </div>
    </div>
  )
}

export default UserStats