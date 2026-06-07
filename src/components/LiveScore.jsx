export default function LiveScore({ game }) {
  const getScoreColor = (winner) => {
    return winner ? 'text-green-400' : 'text-gray-300'
  }

  const isLeading = game.homeScore > game.awayScore

  return (
    <div className="bg-gradient-to-br from-red-900/40 to-gray-900 rounded-lg border-2 border-red-500/60 p-6 animate-pulse-slow hover:animate-none transition-all">
      {/* LIVE Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-red-400">🔴 LIVE NOW</span>
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
            <div className="text-sm font-bold text-white truncate">{game.homeTeam}</div>
          </div>
          <div className="text-4xl font-black text-white">{game.homeScore}</div>
        </div>

        {/* Sets Display */}
        <div className="flex flex-col justify-center">
          <div className="text-center mb-3">
            <div className="text-xs text-gray-400 mb-1">SETS</div>
            <div className="flex gap-2 justify-center">
              {game.linescores?.home?.map((set, idx) => (
                <div key={idx} className="bg-gray-700 rounded px-2 py-1">
                  <div className="text-xs text-gray-300">{set.value || '0'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            {game.status === 'ongoing' ? 'In Progress' : 'Completed'}
          </div>
        </div>

        {/* Away Team */}
        <div className={`text-center p-3 rounded ${!isLeading && game.awayScore > 0 ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-800/30'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {game.awayAthleteFlag && (
              <img src={game.awayAthleteFlag} alt="flag" className="w-4 h-3 rounded" />
            )}
            <div className="text-sm font-bold text-white truncate">{game.awayTeam}</div>
          </div>
          <div className="text-4xl font-black text-white">{game.awayScore}</div>
        </div>
      </div>

      {/* Set Details */}
      <div className="bg-gray-900/50 rounded p-3 text-xs">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <span className="text-gray-400">Games: </span>
            <span className="text-white font-bold">{game.sets?.homeWon || 0}</span>
          </div>
          <div>
            <span className="text-gray-400">Games: </span>
            <span className="text-white font-bold">{game.sets?.awayWon || 0}</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        ⚡ Live • Updates every 60s
      </div>
    </div>
  )
}
