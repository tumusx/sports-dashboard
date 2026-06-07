import { useState, useEffect } from 'react'
import './App.css'
import TournamentSelector from './components/TournamentSelector'
import GamesList from './components/GamesList'
import useSportsData from './hooks/useSportsData'

const TOURNAMENTS = {
  atp: {
    id: '133602',
    name: 'ATP Wimbledon',
    sport: 'Tennis',
  },
  wta: {
    id: '133603',
    name: 'WTA Wimbledon',
    sport: 'Tennis',
  },
}

function App() {
  const [selectedTournament, setSelectedTournament] = useState('atp')
  const tournament = TOURNAMENTS[selectedTournament]
  const { games, loading, lastUpdate, error } = useSportsData(tournament.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Sports Dashboard
          </h1>
          <p className="text-gray-400">Live scores & tournament tracking</p>
        </div>

        {/* Tournament Selector */}
        <TournamentSelector
          tournaments={TOURNAMENTS}
          selectedTournament={selectedTournament}
          onSelectTournament={setSelectedTournament}
        />

        {/* Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Last update: </span>
              <span className="text-green-400">
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Loading...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
              <span className="text-gray-400">
                {loading ? 'Updating...' : 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Games List */}
        <GamesList games={games} loading={loading} />
      </div>
    </div>
  )
}

export default App
