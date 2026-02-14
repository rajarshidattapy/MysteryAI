// src/Stats/WalletLeaderboard.jsx
import React, { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Trophy, Medal, ShieldCheck, Timer, Hash, Award } from 'lucide-react'
import { DEAD_DROP_REGISTRY_ADDRESS, DEAD_DROP_REGISTRY_ABI } from '../monad/deadDropRegistry'
import { monadTestnet } from '../../waqmi.config'
import { getPointsForDifficulty } from '../utils/difficulty'

// Helper to truncate addresses like 0x1234...abcd
const shortAddr = (addr) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

const WalletLeaderboard = () => {
  const publicClient = usePublicClient({ chainId: monadTestnet.id })

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)

      if (!publicClient) {
        setLoading(false)
        return
      }

      try {
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
              fromBlock,
              toBlock
            })
            allLogs.push(...logs)
          } catch (chunkError) {
            console.warn(`Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, chunkError)
          }
        }

        const logs = allLogs

        // Aggregate by wallet address
        const byWallet = new Map()

        // First pass: aggregate solve data
        for (const log of logs) {
          const solver = log.args.solver
          const solveTime = Number(log.args.solveTime)
          const mysteryId = log.args.mysteryId

          if (!byWallet.has(solver)) {
            byWallet.set(solver, {
              wallet_address: solver,
              total_solves: 0,
              fastest_time: solveTime,
              total_time: 0,
              total_points: 0,
              mysteryIds: []
            })
          }

          const entry = byWallet.get(solver)
          entry.total_solves += 1
          entry.total_time += solveTime
          entry.mysteryIds.push(mysteryId)

          if (solveTime < entry.fastest_time) {
            entry.fastest_time = solveTime
          }
        }

        // Second pass: fetch difficulty for each mystery to calculate points
        for (const [solver, entry] of byWallet.entries()) {
          let totalPoints = 0

          for (const mysteryId of entry.mysteryIds) {
            try {
              const mysteryData = await publicClient.readContract({
                address: DEAD_DROP_REGISTRY_ADDRESS,
                abi: DEAD_DROP_REGISTRY_ABI,
                functionName: 'mysteries',
                args: [mysteryId]
              })

              // mysteryData structure: [answerHash, createdAt, solved, solver, solveTime, difficulty]
              const difficulty = Number(mysteryData[5])
              const points = getPointsForDifficulty(difficulty)
              totalPoints += points
            } catch (err) {
              console.error(`Error fetching difficulty for mystery ${mysteryId}:`, err)
            }
          }

          entry.total_points = totalPoints
        }

        // Convert to array and sort by total points (descending), then by fastest time
        const leaderboard = Array.from(byWallet.values())
          .sort((a, b) => {
            if (a.total_points !== b.total_points) {
              return b.total_points - a.total_points // Higher points first
            }
            return a.fastest_time - b.fastest_time // Faster time as tiebreaker
          })

        setRows(leaderboard)
      } catch (error) {
        console.error('Error fetching leaderboard from chain:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [publicClient])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Medal icons for top 3
  const getMedalIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-300" />
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return <ShieldCheck className="w-4 h-4 text-slate-600" />
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">Loading leaderboard from blockchain...</p>
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-400" />
          Global Leaderboard
        </h2>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">No mysteries solved yet. Be the first!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-purple-400" />
        Global Leaderboard
      </h2>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-yellow-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-3 h-3" />
                  Points
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Hash className="w-3 h-3" />
                  Solves
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Timer className="w-3 h-3" />
                  Fastest
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, idx) => (
              <tr
                key={row.wallet_address}
                className={`hover:bg-slate-800/30 transition-colors ${
                  idx < 3 ? 'bg-slate-800/20' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(idx)}
                    <span className="text-slate-300 font-bold">#{idx + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono text-purple-300">
                    {shortAddr(row.wallet_address)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-lg font-bold text-yellow-400">
                    {row.total_points}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm text-slate-300">
                    {row.total_solves}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="text-sm font-bold text-green-400">
                    {formatTime(row.fastest_time)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WalletLeaderboard