import { useState, useEffect } from 'react'
import './App.css'
import TypeFilter from './components/TypeFilter'
import GamesList from './components/GamesList'
import { useTheSportsDB, useATPTournaments, THESPORTSDB_TOURNAMENT_IDS } from './hooks/useTheSportsDB'

function App() {
  const [selectedType, setSelectedType] = useState('all') // all, atp, wta
  const [selectedTournament, setSelectedTournament] = useState(null)

  // Buscar torneios ATP em LIVE
  const { tournaments: liveTournaments, loading: tournamentsLoading } = useATPTournaments()

  // Definir o primeiro torneio como padrão quando carregar
  useEffect(() => {
    if (liveTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(liveTournaments[0].id)
    }
  }, [liveTournaments])

  // Buscar jogos do torneio selecionado
  const { games: rawGames, loading: gamesLoading, lastUpdate, error } = useTheSportsDB(selectedTournament)

  // Filtrar jogos por tipo (ATP/WTA)
  const filteredGames = rawGames.filter(game => {
    if (selectedType === 'all') return true
    return game.type === selectedType
  })

  const currentTournament = liveTournaments.find(t => t.id === selectedTournament)
  const loading = tournamentsLoading || gamesLoading

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 ATP Live Dashboard
          </h1>
          <p className="text-gray-400">Official ATP tournaments • Real-time scores & match tracking</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Tournament Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Tournament (LIVE)
            </label>
            {tournamentsLoading ? (
              <div className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                Loading tournaments...
              </div>
            ) : liveTournaments.length === 0 ? (
              <div className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-red-400">
                No live tournaments found
              </div>
            ) : (
              <select
                value={selectedTournament || ''}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              >
                {liveTournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.emoji} {tournament.name}
                  </option>
                ))}
              </select>
            )}
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
              {currentTournament?.name || 'Select a tournament'}
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
