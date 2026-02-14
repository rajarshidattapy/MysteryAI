// src/Stats/UserStats.jsx
import React, { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Trophy, Timer, Hash, Target, Award } from 'lucide-react'
import { DEAD_DROP_REGISTRY_ADDRESS, DEAD_DROP_REGISTRY_ABI } from '../monad/deadDropRegistry'
import { monadTestnet } from '../../waqmi.config'
import { getPointsForDifficulty } from '../utils/difficulty'

const UserStats = () => {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: monadTestnet.id })

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    totalSolveTime: 0,
    fastestSolve: null,
    totalPoints: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !address || !publicClient) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Get the latest block number
        const latestBlock = await publicClient.getBlockNumber()

        // Monad limits eth_getLogs to 100 block range, so we need to chunk
        const CHUNK_SIZE = 100n
        const allLogs = []

        // Fetch logs in chunks
        for (let fromBlock = 0n; fromBlock <= latestBlock; fromBlock += CHUNK_SIZE) {
          const toBlock = fromBlock + CHUNK_SIZE - 1n > latestBlock
            ? latestBlock
            : fromBlock + CHUNK_SIZE - 1n

          try {
            const logs = await publicClient.getLogs({
              address: DEAD_DROP_REGISTRY_ADDRESS,
              event: {
                type: 'event',
                name: 'MysterySolved',
                inputs: [
                  { indexed: true, name: 'mysteryId', type: 'uint256' },
                  { indexed: true, name: 'solver', type: 'address' },
                  { indexed: false, name: 'solveTime', type: 'uint256' }
                ]
              },
              args: {
                solver: address // Filter by connected wallet
              },
              fromBlock,
              toBlock
            })
            allLogs.push(...logs)
          } catch (chunkError) {
            console.warn(`Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, chunkError)
          }
        }

        const logs = allLogs

        // Compute stats from events
        const gamesPlayed = logs.length
        const wins = logs.length // All logged events are wins

        let totalTime = 0
        let fastestTime = null
        let totalPoints = 0

        // Fetch difficulty for each solved mystery to calculate points
        for (const log of logs) {
          const solveTime = Number(log.args.solveTime)
          totalTime += solveTime

          if (fastestTime === null || solveTime < fastestTime) {
            fastestTime = solveTime
          }

          // Fetch mystery data to get difficulty
          try {
            const mysteryId = log.args.mysteryId
            const mysteryData = await publicClient.readContract({
              address: DEAD_DROP_REGISTRY_ADDRESS,
              abi: DEAD_DROP_REGISTRY_ABI,
              functionName: 'mysteries',
              args: [mysteryId]
            })

            // mysteryData structure: [answerHash, createdAt, solved, solver, solveTime, difficulty]
            const difficulty = Number(mysteryData[5]) // difficulty is the 6th element (index 5)
            const points = getPointsForDifficulty(difficulty)
            totalPoints += points

            console.log(`Mystery ${mysteryId}: difficulty ${difficulty}, points ${points}`)
          } catch (err) {
            console.error(`Error fetching difficulty for mystery ${log.args.mysteryId}:`, err)
          }
        }

        setStats({
          gamesPlayed,
          wins,
          totalSolveTime: totalTime,
          fastestSolve: fastestTime,
          totalPoints
        })

      } catch (error) {
        console.error('Error fetching user stats from chain:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address, isConnected, publicClient])

  const formatTime = (seconds) => {
    if (seconds === null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const avgSolveTime = stats.gamesPlayed > 0
    ? Math.floor(stats.totalSolveTime / stats.gamesPlayed)
    : 0

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">Connect your wallet to view stats</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">Loading stats from blockchain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-purple-400" />
        Your Stats
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Points */}
        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-300 uppercase tracking-wider font-bold">Total Points</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.totalPoints}</p>
        </div>

        {/* Games Played */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Hash className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Games Played</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.gamesPlayed}</p>
        </div>

        {/* Wins */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Wins</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.wins}</p>
        </div>

        {/* Average Solve Time */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Timer className="w-5 h-5 text-green-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Solve Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(avgSolveTime)}</p>
        </div>

        {/* Fastest Solve */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Fastest Solve</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(stats.fastestSolve)}</p>
        </div>

      </div>
    </div>
  )
}

export default UserStats