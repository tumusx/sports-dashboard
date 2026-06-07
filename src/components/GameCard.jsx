export default function GameCard({ game }) {
  const getStatusColor = (status) => {
    if (status === 'ongoing') return 'bg-red-900/30 text-red-400'
    if (status === 'finished') return 'bg-gray-700/30 text-gray-300'
    return 'bg-gray-800/30 text-gray-400'
  }

  const getTypeIcon = (type) => {
    return type === 'atp' ? '🔵' : '🔴'
  }

  const isLive = game.status === 'ongoing'

  const formatScore = (points) => {
    const scoreMap = { 0: '0', 15: '15', 30: '30', 45: '40' }
    return scoreMap[points] || '0'
  }

  return (
    <div className={`bg-gray-800 rounded-lg border-2 p-5 transition-all ${
      isLive ? 'border-red-500/50' : 'border-gray-700'
    }`}>
      {/* Header: Status + Type + LIVE Indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
          {game.status === 'ongoing' ? '🔴 LIVE' : game.status === 'finished' ? '✓ Finished' : 'Scheduled'}
        </span>
        <span className="text-lg">{getTypeIcon(game.type)}</span>
      </div>

      {/* Court & Time */}
      <div className="text-xs text-gray-400 mb-4 pb-4 border-b border-gray-700">
        <div className="font-semibold text-gray-300">{game.court}</div>
        <div className="text-gray-500">{game.date} • {game.time}</div>
      </div>

      {/* Teams & Scores */}
      <div className="mb-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {game.homeTeam}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Sets */}
            <div className="text-center">
              <div className="text-xs text-gray-400">Sets</div>
              <div className="text-2xl font-bold text-white">
                {game.sets?.homeWon || 0}
              </div>
            </div>
            {/* Games */}
            <div className="text-center">
              <div className="text-xs text-gray-400">Games</div>
              <div className="text-2xl font-bold text-white">
                {game.points?.homeGames || 0}
              </div>
            </div>
            {/* Points */}
            <div className="text-center bg-blue-900/30 px-3 py-2 rounded">
              <div className="text-xs text-gray-400">Pts</div>
              <div className="text-xl font-bold text-blue-400">
                {formatScore(game.points?.home || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-700"></div>

        {/* Away Team */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {game.awayTeam}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Sets */}
            <div className="text-center">
              <div className="text-xs text-gray-400">Sets</div>
              <div className="text-2xl font-bold text-white">
                {game.sets?.awayWon || 0}
              </div>
            </div>
            {/* Games */}
            <div className="text-center">
              <div className="text-xs text-gray-400">Games</div>
              <div className="text-2xl font-bold text-white">
                {game.points?.awayGames || 0}
              </div>
            </div>
            {/* Points */}
            <div className="text-center bg-purple-900/30 px-3 py-2 rounded">
              <div className="text-xs text-gray-400">Pts</div>
              <div className="text-xl font-bold text-purple-400">
                {formatScore(game.points?.away || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Status Info */}
      {isLive && (
        <div className="text-xs text-red-400 text-center pt-3 border-t border-gray-700">
          ⚡ Match in progress • Updates every 30 seconds
        </div>
      )}
    </div>
  )
}
