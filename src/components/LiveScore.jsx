import { useState } from 'react'
import { usePlayerStats } from '../hooks/usePlayerStats'
import PlayerModal from './PlayerModal'

export default function LiveScore({ game }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const { playerStats, loading, fetchPlayerStats } = usePlayerStats()

  const handlePlayerClick = (athleteId, playerName) => {
    setSelectedPlayer(playerName)
    fetchPlayerStats(athleteId, game.type)
  }

  const handleCloseModal = () => {
    setSelectedPlayer(null)
  }

  const getScoreColor = (winner) => {
    return winner ? 'text-green-400' : 'text-gray-300'
  }

  const isLive = game.status === 'ongoing'
  const homeBig = isLive ? (game.points?.homeGames ?? 0) : game.homeScore
  const awayBig = isLive ? (game.points?.awayGames ?? 0) : game.awayScore
  const isLeading = homeBig > awayBig

  return (
    <div className="bg-gradient-to-br from-red-900/40 to-gray-900 rounded-lg border-2 border-red-500/60 p-6 animate-pulse-slow hover:animate-none transition-all">
      {/* LIVE Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${game.status === 'ongoing' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className={`text-sm font-bold ${game.status === 'ongoing' ? 'text-red-400' : 'text-green-400'}`}>
            {game.status === 'ongoing' ? '🔴 LIVE NOW' : '✓ JUST FINISHED'}
          </span>
        </div>
        <span className="text-xs text-gray-400">{game.court}</span>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Home Team */}
        <div className={`text-center p-3 rounded ${isLeading ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-800/30'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {game.homeAthleteFlag && (
              <img src={game.homeAthleteFlag} alt="flag" className="w-4 h-3 rounded" />
            )}
            <div
              className="text-sm font-bold text-white truncate cursor-pointer hover:text-blue-400 transition"
              onClick={() => game.homeAthleteId && handlePlayerClick(game.homeAthleteId, game.homeTeam)}
            >
              {game.homeTeam}
            </div>
          </div>
          <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
            {homeBig}
            {game.serving === 'home' && <span className="text-yellow-400 text-base">🎾</span>}
          </div>
          {isLive && (
            <div className="text-xs text-gray-400 mt-1">
              Sets: <span className="text-white font-bold">{game.homeScore}</span>
            </div>
          )}
        </div>

        {/* Sets Display — só sets COMPLETOS */}
        <div className="flex flex-col justify-center">
          <div className="text-center mb-3">
            <div className="text-xs text-gray-400 mb-1">SETS</div>
            <div className="flex flex-col gap-0.5 items-center">
              {(() => {
                const homeCompletedSets = (game.linescores?.home || []).filter(s => s.winner !== undefined)
                const awayCompletedSets = (game.linescores?.away || []).filter(s => s.winner !== undefined)
                if (homeCompletedSets.length === 0) {
                  return <div className="text-sm text-gray-400">—</div>
                }
                return homeCompletedSets.map((hSet, idx) => {
                  const aSet = awayCompletedSets[idx]
                  return (
                    <div key={idx} className="flex gap-1 text-sm font-bold">
                      <span className={hSet.winner ? 'text-green-400' : 'text-gray-300'}>{hSet.value}{hSet.tiebreak != null && <sup className="text-[9px]">{hSet.tiebreak}</sup>}</span>
                      <span className="text-gray-500">-</span>
                      <span className={aSet?.winner ? 'text-green-400' : 'text-gray-300'}>{aSet?.value ?? '-'}{aSet?.tiebreak != null && <sup className="text-[9px]">{aSet.tiebreak}</sup>}</span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            {isLive ? (game.setLabel || 'In Progress') : 'Completed'}
          </div>
        </div>

        {/* Away Team */}
        <div className={`text-center p-3 rounded ${!isLeading && game.awayScore > 0 ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-800/30'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {game.awayAthleteFlag && (
              <img src={game.awayAthleteFlag} alt="flag" className="w-4 h-3 rounded" />
            )}
            <div
              className="text-sm font-bold text-white truncate cursor-pointer hover:text-blue-400 transition"
              onClick={() => game.awayAthleteId && handlePlayerClick(game.awayAthleteId, game.awayTeam)}
            >
              {game.awayTeam}
            </div>
          </div>
          <div className="text-4xl font-black text-white flex items-center justify-center gap-1">
            {awayBig}
            {game.serving === 'away' && <span className="text-yellow-400 text-base">🎾</span>}
          </div>
          {isLive && (
            <div className="text-xs text-gray-400 mt-1">
              Sets: <span className="text-white font-bold">{game.awayScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Set Details */}
      <div className="bg-gray-900/50 rounded p-3 text-xs">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <span className="text-gray-400">Sets: </span>
            <span className="text-white font-bold">{game.sets?.homeWon ?? 0}</span>
            <span className="text-gray-500 mx-1">•</span>
            <span className="text-gray-400">Games: </span>
            <span className="text-white font-bold">{game.points?.homeGames ?? 0}</span>
          </div>
          <div>
            <span className="text-gray-400">Sets: </span>
            <span className="text-white font-bold">{game.sets?.awayWon ?? 0}</span>
            <span className="text-gray-500 mx-1">•</span>
            <span className="text-gray-400">Games: </span>
            <span className="text-white font-bold">{game.points?.awayGames ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Resumo descritivo da ESPN */}
      {game.summary && (
        <div className="mt-2 text-xs text-gray-400 text-center italic truncate">
          {game.summary}
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        ⚡ Live • Updates every 30s
        {game.serving && (
          <span className="ml-2 text-yellow-400">
            🎾 {game.serving === 'home' ? game.homeTeam : game.awayTeam} sacando
          </span>
        )}
      </div>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={playerStats}
          loading={loading}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
