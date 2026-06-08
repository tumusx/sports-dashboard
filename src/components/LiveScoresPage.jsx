import { useMemo, useState, useEffect } from 'react'
import LiveScore from './LiveScore'
import TypeFilter from './TypeFilter'

export default function LiveScoresPage({ tournaments, selectedDate, setSelectedDate, onBack, refetch }) {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTournament, setSelectedTournament] = useState(null)

  // Auto-refresh a cada 30 segundos quando na página de live scores
  useEffect(() => {
    if (!refetch) return
    console.log('[LiveScoresPage] auto-refresh ativado (30s)')
    const interval = setInterval(() => {
      console.log('[LiveScoresPage] disparando refetch')
      refetch()
    }, 30000)
    return () => {
      console.log('[LiveScoresPage] limpando interval')
      clearInterval(interval)
    }
  }, [refetch])

  // Get all live matches (ongoing or finished - for demo, show finished as recent)
  const liveMatches = useMemo(() => {
    const matches = []
    tournaments.forEach(tournament => {
      tournament.matches.forEach(match => {
        if (match.status === 'ongoing' || match.status === 'finished') {
          matches.push({ ...match, tournamentName: tournament.name, tournamentEmoji: tournament.emoji })
        }
      })
    })
    return matches
  }, [tournaments])

  // Get unique tournaments with live matches
  const tournamentsWithLive = useMemo(() => {
    const uniqueTournaments = new Map()
    liveMatches.forEach(match => {
      if (!uniqueTournaments.has(match.tournamentName)) {
        uniqueTournaments.set(match.tournamentName, {
          name: match.tournamentName,
          emoji: match.tournamentEmoji,
          count: 0
        })
      }
      uniqueTournaments.get(match.tournamentName).count++
    })
    return Array.from(uniqueTournaments.values())
  }, [liveMatches])

  // Filter matches
  const filteredMatches = useMemo(() => {
    return liveMatches.filter(match => {
      if (selectedType !== 'all' && match.type !== selectedType) return false
      if (selectedTournament && match.tournamentName !== selectedTournament) return false
      return true
    })
  }, [liveMatches, selectedType, selectedTournament])

  if (liveMatches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No live matches right now</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for ongoing matches</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔴 LIVE SCORES
            </h1>
            <p className="text-red-400">Real-time match updates • Updates every 30 seconds</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
            >
              ← Dashboard
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tournament Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Filter by Tournament
            </label>
            <select
              value={selectedTournament || ''}
              onChange={(e) => setSelectedTournament(e.target.value || null)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="">All Tournaments ({liveMatches.length})</option>
              {tournamentsWithLive.map(t => (
                <option key={t.name} value={t.name}>
                  {t.emoji} {t.name} ({t.count})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Filter by Type
            </label>
            <div className="flex gap-2">
              {['all', 'atp', 'wta'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all font-medium ${
                    selectedType === type
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {type === 'all' ? '🎾 All' : type === 'atp' ? '🔵 ATP' : '🔴 WTA'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {filteredMatches.length} Live Match{filteredMatches.length !== 1 ? 'es' : ''}
          </h2>

          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400">No live matches with selected filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map(match => (
                <div key={match.id}>
                  <div className="text-xs text-gray-400 mb-2 font-semibold">
                    {match.tournamentEmoji} {match.tournamentName}
                  </div>
                  <LiveScore game={match} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
