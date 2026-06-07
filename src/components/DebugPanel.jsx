import { useState, useEffect } from 'react'

const ATP_TOURNAMENTS = [
  { league: 'Australian Open', name: 'Australian Open' },
  { league: 'French Open', name: 'French Open (Roland Garros)' },
  { league: 'Wimbledon', name: 'Wimbledon' },
  { league: 'US Open', name: 'US Open' },
  { league: 'Rome Masters', name: 'Rome Masters' },
  { league: 'Paris Masters', name: 'Paris Masters' },
]

export default function DebugPanel() {
  const [expanded, setExpanded] = useState(false)
  const [debugData, setDebugData] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const data = {}

    for (const tournament of ATP_TOURNAMENTS) {
      try {
        // Tentar endpoint alternativo primeiro
        let response = await fetch(
          `https://www.thesportsdb.com/api/v1/eventsround.php?id=${tournament.league}&round=1`
        ).catch(() => null)

        let json = response ? await response.json() : null

        // Se falhar, tenta endpoint de últimos eventos
        if (!json?.results) {
          response = await fetch(
            `https://www.thesportsdb.com/api/v1/eventslast.php?id=${tournament.league}`
          )
          json = await response.json()
        }

        const matches = json.results || []
        const todayMatches = matches.filter(e => {
          const eventDate = e.dateEvent || ''
          const checkDate = new Date(today)
          const eventDateObj = new Date(eventDate)
          return Math.abs(checkDate - eventDateObj) < 24 * 60 * 60 * 1000
        })

        data[tournament.name] = {
          league: tournament.league,
          totalMatches: matches.length,
          todayMatches: todayMatches.length,
          todayData: todayMatches.slice(0, 3).map(m => ({
            home: m.strHomeTeam,
            away: m.strAwayTeam,
            date: m.dateEvent,
            status: m.strStatus,
            score: `${m.intHomeScore}-${m.intAwayScore}`,
          })),
        }
      } catch (err) {
        data[tournament.name] = { error: err.message }
      }
    }

    setDebugData(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        {expanded ? '❌ Debug' : '🐛 Debug'}
      </button>

      {expanded && (
        <div className="absolute bottom-12 right-0 bg-gray-900 border-2 border-purple-600 rounded-lg p-4 max-w-2xl max-h-96 overflow-auto shadow-2xl">
          <h3 className="text-white font-bold mb-4">API Debug Info</h3>

          <button
            onClick={fetchDebugData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm mb-4"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <div className="space-y-3">
            {Object.entries(debugData).map(([tournament, info]) => (
              <div key={tournament} className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="text-sm font-semibold text-white mb-2">
                  {tournament}
                </div>

                {info.error ? (
                  <div className="text-red-400 text-xs">{info.error}</div>
                ) : (
                  <>
                    <div className="text-xs text-gray-400 mb-2">
                      Total: {info.totalMatches} matches | Today: {info.todayMatches} matches
                    </div>

                    {info.todayMatches > 0 ? (
                      <div className="space-y-1">
                        {info.todayData.map((match, idx) => (
                          <div key={idx} className="text-xs text-gray-300 bg-gray-700 p-2 rounded">
                            <div>
                              {match.home} vs {match.away}
                            </div>
                            <div className="text-gray-400">
                              Date: {match.date} | Score: {match.score}
                            </div>
                            <div className="text-gray-400">
                              Status: {match.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-yellow-400">No matches found for today</div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-400 border-t border-gray-700 pt-2">
            <div>Today: {new Date().toISOString().split('T')[0]}</div>
            <div>Checking if API returns matches for this date</div>
          </div>
        </div>
      )}
    </div>
  )
}
