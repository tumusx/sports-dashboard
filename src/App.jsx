import { useState, useEffect } from 'react'
import './App.css'
import TypeFilter from './components/TypeFilter'
import GamesList from './components/GamesList'
import { useTheSportsDB, useATPTournaments, THESPORTSDB_TOURNAMENT_IDS } from './hooks/useTheSportsDB'

function App() {
  const [selectedType, setSelectedType] = useState('all') // all, atp, wta
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Buscar torneios ATP (LIVE + COMPLETED)
  const { tournaments: allTournaments, loading: tournamentsLoading, hasTodayMatches } = useATPTournaments()

  // Separar por status
  const liveTournaments = allTournaments.filter(t => t.status === 'LIVE')
  const completedTournaments = allTournaments.filter(t => t.status === 'COMPLETED')

  // Se não houver LIVE, mostrar COMPLETED automaticamente
  useEffect(() => {
    if (!hasTodayMatches && completedTournaments.length > 0) {
      setShowCompleted(true)
    }
  }, [hasTodayMatches, completedTournaments.length])

  // Definir o primeiro torneio como padrão quando carregar
  useEffect(() => {
    const tournamentsToUse = showCompleted ? completedTournaments : liveTournaments
    if (tournamentsToUse.length > 0 && !selectedTournament) {
      setSelectedTournament(tournamentsToUse[0].id)
    }
  }, [liveTournaments, completedTournaments, showCompleted])

  // Buscar jogos do torneio selecionado
  const { games: rawGames, loading: gamesLoading, lastUpdate, error } = useTheSportsDB(selectedTournament)

  // Filtrar jogos por status (LIVE ou FINISHED baseado na seleção)
  const statusFilter = showCompleted ? 'finished' : 'ongoing'
  const filteredByStatus = rawGames.filter(game => {
    if (showCompleted) return game.status === 'finished'
    return game.status === 'ongoing'
  })

  // Filtrar jogos por tipo (ATP/WTA)
  const filteredGames = filteredByStatus.filter(game => {
    if (selectedType === 'all') return true
    return game.type === selectedType
  })

  const tournamentsToShow = showCompleted ? completedTournaments : liveTournaments
  const currentTournament = tournamentsToShow.find(t => t.id === selectedTournament)
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
          {/* LIVE / COMPLETED Toggle */}
          {liveTournaments.length > 0 && completedTournaments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Match Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCompleted(false)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    !showCompleted
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  🔴 LIVE ({liveTournaments.reduce((sum, t) => sum + (t.liveCount || 0), 0)})
                </button>
                <button
                  onClick={() => setShowCompleted(true)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    showCompleted
                      ? 'bg-green-600 border-green-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  ✓ COMPLETED ({completedTournaments.reduce((sum, t) => sum + (t.finishedCount || 0), 0)})
                </button>
              </div>
            </div>
          )}

          {/* Tournament Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Tournament {showCompleted ? '(Completed Today)' : '(Live Now)'}
            </label>
            {tournamentsLoading ? (
              <div className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                Loading tournaments...
              </div>
            ) : tournamentsToShow.length === 0 ? (
              <div className="w-full p-3 bg-gray-800 border border-orange-700 rounded-lg text-orange-400">
                {showCompleted
                  ? 'No completed tournaments today'
                  : 'No live tournaments right now. Showing completed matches...'}
              </div>
            ) : (
              <select
                value={selectedTournament || ''}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              >
                {tournamentsToShow.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.emoji} {tournament.name}
                    {showCompleted
                      ? ` • ${tournament.finishedCount} finished`
                      : ` • ${tournament.liveCount} live`}
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
        <div className={`mb-6 p-4 rounded-lg border ${
          showCompleted
            ? 'bg-green-900/20 border-green-700'
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Last update: </span>
              <span className={showCompleted ? 'text-green-400' : 'text-red-400'}>
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Initializing...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                loading
                  ? 'bg-yellow-400 animate-pulse'
                  : showCompleted
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`}></span>
              <span className="text-gray-400">
                {loading
                  ? 'Syncing...'
                  : showCompleted
                  ? 'Showing Completed'
                  : 'Live'}
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
