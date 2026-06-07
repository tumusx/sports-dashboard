import { useEffect } from 'react'

export default function PlayerModal({ player, loading, onClose }) {
  if (!player && !loading) return null

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleClose = () => {
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
        >
          ✕
        </button>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-700 border-t-red-500 rounded-full"></div>
          </div>
        ) : player ? (
          <>
            {/* Player Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {player.displayName}
              </h2>
              {player.birthPlace && (
                <p className="text-gray-400 text-sm">📍 {player.birthPlace}</p>
              )}
            </div>

            {/* Win/Loss Record - Destaque */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border border-blue-500/30">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">RECORD</div>
                <div className="flex justify-center gap-4">
                  <div>
                    <div className="text-3xl font-black text-green-400">{player.wins}</div>
                    <div className="text-xs text-gray-400">Wins</div>
                  </div>
                  <div className="text-2xl text-gray-500">-</div>
                  <div>
                    <div className="text-3xl font-black text-red-400">{player.losses}</div>
                    <div className="text-xs text-gray-400">Losses</div>
                  </div>
                </div>
                {player.wins + player.losses > 0 && (
                  <div className="text-xs text-gray-400 mt-2">
                    Winrate: {Math.round((player.wins / (player.wins + player.losses)) * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Titles & Prize */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-yellow-900/30 rounded p-3 border border-yellow-500/30">
                <div className="text-xs text-gray-400 mb-1">SINGLES TITLES</div>
                <div className="text-2xl font-black text-yellow-400">
                  {player.titles}
                </div>
              </div>
              <div className="bg-purple-900/30 rounded p-3 border border-purple-500/30">
                <div className="text-xs text-gray-400 mb-1">DOUBLES TITLES</div>
                <div className="text-2xl font-black text-purple-400">
                  {player.doublesTitles}
                </div>
              </div>
            </div>

            {/* Prize Money */}
            {player.prize > 0 && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">PRIZE MONEY</div>
                <div className="text-xl font-bold text-white">
                  ${(player.prize / 1000000).toFixed(2)}M
                </div>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {player.age && (
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">AGE</div>
                  <div className="text-lg font-bold text-white">{player.age}</div>
                </div>
              )}
              {player.hand && (
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">HAND</div>
                  <div className="text-lg font-bold text-white">{player.hand}</div>
                </div>
              )}
              {player.height && (
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">HEIGHT</div>
                  <div className="text-sm font-bold text-white">{player.height}</div>
                </div>
              )}
              {player.experience && (
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">PRO SINCE</div>
                  <div className="text-lg font-bold text-white">
                    {new Date().getFullYear() - player.experience}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
