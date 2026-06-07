export default function TournamentSelector({ tournaments, selectedTournament, onSelectTournament }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">Select Tournament</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(tournaments).map(([key, tournament]) => (
          <button
            key={key}
            onClick={() => onSelectTournament(key)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTournament === key
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-semibold">{tournament.name}</div>
            <div className="text-sm opacity-75">{tournament.sport}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
