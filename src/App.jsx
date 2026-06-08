import { useState, useMemo, useEffect } from 'react'
import './App.css'
import TypeFilter from './components/TypeFilter'
import CategoryFilter from './components/CategoryFilter'
import GamesList from './components/GamesList'
import LiveScoresPage from './components/LiveScoresPage'
import { useESPNTennis } from './hooks/useESPNTennis'

function App() {
  const [showLiveScores, setShowLiveScores] = useState(false)
  const [selectedType, setSelectedType] = useState('all') // all, atp, wta
  const [selectedCategory, setSelectedCategory] = useState('all') // tournament type
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Buscar dados de tênis da ESPN
  const { tournaments, loading: tournamentsLoading, lastUpdate, error, selectedDate, setSelectedDate, refetch } = useESPNTennis()

  // Auto-refresh a cada 30s no Dashboard (pausa quando LiveScoresPage está ativa, que já tem seu próprio)
  useEffect(() => {
    if (showLiveScores || !refetch) return
    console.log('[App/Dashboard] auto-refresh ativado (30s)')
    const interval = setInterval(() => {
      console.log('[App/Dashboard] disparando refetch')
      refetch()
    }, 30000)
    return () => {
      console.log('[App/Dashboard] limpando interval')
      clearInterval(interval)
    }
  }, [refetch, showLiveScores])

  // Filtrar torneios por categoria
  const filteredTournamentsByCategory = useMemo(() => {
    if (selectedCategory === 'all') return tournaments
    return tournaments.filter(t => t.category === selectedCategory)
  }, [tournaments, selectedCategory])

  // Separar por status (LIVE / COMPLETED)
  const liveTournaments = useMemo(() =>
    filteredTournamentsByCategory.filter(t => t.liveCount > 0),
    [filteredTournamentsByCategory]
  )

  const completedTournaments = useMemo(() =>
    filteredTournamentsByCategory.filter(t => t.liveCount === 0 && t.finishedCount > 0),
    [filteredTournamentsByCategory]
  )

  // Auto-mostrar completed se não houver live
  const shouldShowCompleted = liveTournaments.length === 0 && completedTournaments.length > 0
  const displayShowCompleted = shouldShowCompleted || showCompleted

  // Torneios a mostrar
  const tournamentsToShow = displayShowCompleted ? completedTournaments : liveTournaments

  // Selecionar primeiro torneio automaticamente
  if (!selectedTournament && tournamentsToShow.length > 0) {
    setSelectedTournament(tournamentsToShow[0].name)
  }

  // Obter dados do torneio selecionado
  const currentTournament = tournamentsToShow.find(t => t.name === selectedTournament)

  // Filtrar jogos por tipo (ATP/WTA)
  const filteredGames = useMemo(() => {
    if (!currentTournament) return []

    return currentTournament.matches
      .filter(game => {
        // Filtrar por tipo
        if (selectedType !== 'all' && game.type !== selectedType) return false
        // Filtrar por status
        // ongoing = LIVE
        // tudo mais (finished, scheduled, null) = COMPLETED
        if (displayShowCompleted) {
          // Mostrar tudo que não é 'ongoing'
          return game.status !== 'ongoing'
        } else {
          // Mostrar apenas 'ongoing'
          return game.status === 'ongoing'
        }
      })
  }, [currentTournament, selectedType, displayShowCompleted])

  // Extrair categorias únicas
  const availableCategories = useMemo(() => {
    return Array.from(new Set(tournaments.map(t => t.category))).sort()
  }, [tournaments])

  const loading = tournamentsLoading

  // Show Live Scores page if toggled
  if (showLiveScores) {
    return (
      <LiveScoresPage
        tournaments={tournaments}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onBack={() => setShowLiveScores(false)}
        refetch={refetch}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🏆 ATP/WTA Dashboard
            </h1>
            <p className="text-gray-400">Real-time scores & tracking</p>
          </div>
          <button
            onClick={() => setShowLiveScores(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            🔴 LIVE SCORES
          </button>
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
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* No Matches */}
        {!loading && tournaments.length === 0 && (
          <div className="mb-6 p-6 bg-orange-900/20 border border-orange-700 rounded-lg text-orange-400 text-center">
            <p className="text-lg font-semibold">No tennis matches found for today</p>
            <p className="text-sm mt-2">Check back later for upcoming matches</p>
          </div>
        )}

        {tournaments.length > 0 && (
          <>
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
                        !displayShowCompleted
                          ? 'bg-red-600 border-red-400 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      🔴 LIVE ({liveTournaments.reduce((sum, t) => sum + t.liveCount, 0)})
                    </button>
                    <button
                      onClick={() => setShowCompleted(true)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium ${
                        displayShowCompleted
                          ? 'bg-green-600 border-green-400 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      ✓ COMPLETED ({completedTournaments.reduce((sum, t) => sum + t.finishedCount, 0)})
                    </button>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {availableCategories.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Filter by Tournament Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      🎾 All Types
                    </button>
                    {availableCategories.map(category => {
                      const count = tournaments.filter(t => t.category === category).length
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            selectedCategory === category
                              ? 'bg-purple-600 border-purple-400 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {category}
                          <span className="text-xs opacity-75 ml-1">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tournament Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Select Tournament {displayShowCompleted ? '(Completed)' : '(Live)'}
                </label>
                {tournamentsToShow.length === 0 ? (
                  <div className="w-full p-3 bg-gray-800 border border-orange-700 rounded-lg text-orange-400">
                    {selectedCategory !== 'all'
                      ? `No tournaments found in ${selectedCategory}`
                      : displayShowCompleted
                      ? 'No completed tournaments'
                      : 'No live tournaments right now'}
                  </div>
                ) : (
                  <select
                    value={selectedTournament || ''}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    {tournamentsToShow.map(tournament => (
                      <option key={tournament.name} value={tournament.name}>
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
            <div
              className={`mb-6 p-4 rounded-lg border ${
                displayShowCompleted
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-red-900/20 border-red-700'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-400">Last update: </span>
                  <span className={displayShowCompleted ? 'text-green-400' : 'text-red-400'}>
                    {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Loading...'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      loading
                        ? 'bg-yellow-400 animate-pulse'
                        : displayShowCompleted
                        ? 'bg-green-400'
                        : 'bg-red-400'
                    }`}
                  ></span>
                  <span className="text-gray-400">
                    {loading ? 'Syncing...' : displayShowCompleted ? 'Showing Completed' : 'Live'}
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
          </>
        )}

      </div>
    </div>
  )
}

export default App
