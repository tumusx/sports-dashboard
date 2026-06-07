export default function GameCard({ game }) {
  const getStatusColor = (status) => {
    if (status.includes('ongoing') || status.includes('live')) return 'bg-red-900/30 text-red-400'
    if (status.includes('finished')) return 'bg-gray-700/30 text-gray-300'
    return 'bg-gray-800/30 text-gray-400'
  }

  const isLive = game.status?.toLowerCase().includes('ongoing') ||
                 game.status?.toLowerCase().includes('live')

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
          {game.status || 'Not Started'}
        </span>
        {isLive && (
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs text-red-400 font-semibold">LIVE</span>
          </div>
        )}
      </div>

      {/* Date & Time */}
      <div className="text-xs text-gray-500 mb-4">
        {game.date} • {game.time}
      </div>

      {/* Score */}
      <div className="mb-4">
        {/* Home Team */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white truncate flex-1">
            {game.homeTeam}
          </span>
          <span className="text-3xl font-bold text-white ml-2 min-w-12 text-right">
            {game.homeScore}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-700 mb-3"></div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white truncate flex-1">
            {game.awayTeam}
          </span>
          <span className="text-3xl font-bold text-white ml-2 min-w-12 text-right">
            {game.awayScore}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span>Match ID: {game.id}</span>
        </div>
      </div>
    </div>
  )
}
