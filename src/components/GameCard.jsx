import { useState } from 'react'
import { usePlayerStats } from '../hooks/usePlayerStats'
import PlayerModal from './PlayerModal'

export default function GameCard({ game }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const { playerStats, loading, fetchPlayerStats } = usePlayerStats()
  const isLive = game.status === 'ongoing'
  const isFinished = game.status === 'finished'
  const isLeading = game.homeScore > game.awayScore

  const handlePlayerClick = (athleteId, playerName) => {
    setSelectedPlayer(playerName)
    fetchPlayerStats(athleteId, game.type)
  }

  const handleCloseModal = () => {
    setSelectedPlayer(null)
    console.log('Modal closed')
  }

  const getWinner = () => {
    if (game.homeScore > game.awayScore) return 'home'
    if (game.awayScore > game.homeScore) return 'away'
    return null
  }

  const winner = getWinner()

  // Quebra nome em 2 linhas se muito longo
  const formatTeamName = (name) => {
    if (name.length > 15) {
      const words = name.split(' ')
      if (words.length > 1) {
        return [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
      }
    }
    return [name]
  }

  return (
    <div className={`bg-gradient-to-br from-gray-850 to-gray-900 rounded-lg border-2 p-5 transition-all ${
      isLive ? 'border-red-500/60 shadow-lg shadow-red-500/20' : 'border-gray-700'
    }`}>
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : isFinished ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className={`text-xs font-bold ${
            isLive ? 'text-red-400' : isFinished ? 'text-green-400' : 'text-gray-400'
          }`}>
            {isLive ? '🔴 LIVE' : isFinished ? '✓ FINISHED' : '⏱️ SCHEDULED'}
          </span>
        </div>
        <span className="text-xs text-gray-400">{game.court}</span>
      </div>

      {/* Main Score Display - 3 Column Layout */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Home Team */}
        <div className={`text-center p-3 rounded-lg transition-colors ${
          isLeading ? 'bg-green-900/40 border border-green-500/50' : 'bg-gray-800/50'
        }`}>
          <div className="mb-2">
            {game.homeAthleteFlag && (
              <img src={game.homeAthleteFlag} alt="flag" className="w-5 h-3 mx-auto mb-1 rounded" />
            )}
            <div
              className={`text-xs font-bold leading-tight cursor-pointer hover:text-blue-400 transition ${
                winner === 'home' ? 'text-green-400' : 'text-gray-200'
              }`}
              onClick={() => {
                if (game.homeAthleteId) handlePlayerClick(game.homeAthleteId, game.homeTeam)
              }}
            >
              {formatTeamName(game.homeTeam).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
              {winner === 'home' && isFinished && ' 🏆'}
            </div>
          </div>
          <div className="text-2xl font-black text-white">{game.homeScore}</div>
        </div>

        {/* Sets Display */}
        <div className="flex flex-col justify-between py-2">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">SETS</div>
            <div className="flex gap-1 justify-center">
              {game.linescores?.home && game.linescores.home.length > 0 ? (
                game.linescores.home.slice(0, 3).map((set, idx) => (
                  <div key={idx} className="bg-gray-700 rounded px-1.5 py-0.5">
                    <div className="text-xs font-bold text-white">{set.value || '0'}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm font-bold text-gray-400">—</div>
              )}
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            {game.date}
          </div>
        </div>

        {/* Away Team */}
        <div className={`text-center p-3 rounded-lg transition-colors ${
          !isLeading && game.awayScore > 0 ? 'bg-green-900/40 border border-green-500/50' : 'bg-gray-800/50'
        }`}>
          <div className="mb-2">
            {game.awayAthleteFlag && (
              <img src={game.awayAthleteFlag} alt="flag" className="w-5 h-3 mx-auto mb-1 rounded" />
            )}
            <div
              className={`text-xs font-bold leading-tight cursor-pointer hover:text-blue-400 transition ${
                winner === 'away' ? 'text-green-400' : 'text-gray-200'
              }`}
              onClick={() => {
                if (game.awayAthleteId) handlePlayerClick(game.awayAthleteId, game.awayTeam)
              }}
            >
              {formatTeamName(game.awayTeam).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
              {winner === 'away' && isFinished && ' 🏆'}
            </div>
          </div>
          <div className="text-2xl font-black text-white">{game.awayScore}</div>
        </div>
      </div>

      {/* Status Footer */}
      {isLive && (
        <div className="text-xs text-red-400 text-center pt-2 border-t border-gray-700/50">
          ⚡ Updates every 60 seconds
        </div>
      )}

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
