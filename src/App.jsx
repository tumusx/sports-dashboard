import { useState, useEffect } from 'react'
import './App.css'
import TournamentSelector from './components/TournamentSelector'
import TypeFilter from './components/TypeFilter'
import GamesList from './components/GamesList'
import { TOURNAMENTS, getTournamentsByStatus } from './data/tournaments'

function App() {
  const [selectedTournament, setSelectedTournament] = useState('wimbledon')
  const [selectedType, setSelectedType] = useState('all') // all, atp, wta
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const liveTournaments = getTournamentsByStatus('LIVE')
  const tournament = TOURNAMENTS[selectedTournament]

  // Filtrar jogos por tipo (ATP/WTA)
  const filteredGames = games.filter(game => {
    if (selectedType === 'all') return true
    return game.type === selectedType
  })

  useEffect(() => {
    const fetchGames = () => {
      setLoading(true)
      if (tournament) {
        // Simular delay da API
        setTimeout(() => {
          setGames(tournament.games)
          setLastUpdate(new Date())
          setLoading(false)
        }, 300)
      }
    }

    fetchGames()
    const interval = setInterval(fetchGames, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [selectedTournament])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Sports Dashboard
          </h1>
          <p className="text-gray-400">Live tournament tracking • Real-time scores</p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Tournament Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Tournament
            </label>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              {liveTournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} • {tournament.status}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <TypeFilter
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Last update: </span>
              <span className="text-green-400">
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Initializing...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
              <span className="text-gray-400">
                {loading ? 'Syncing...' : 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              {tournament?.name}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({filteredGames.length} matches)
              </span>
            </h2>
          </div>
          <GamesList games={filteredGames} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default App
