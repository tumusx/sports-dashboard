import { useState, useEffect } from 'react'

const REFRESH_INTERVAL = 30000 // 30 seconds

const MOCK_GAMES = [
  {
    id: '1',
    homeTeam: 'Novak Djokovic',
    awayTeam: 'Carlos Alcaraz',
    homeScore: 2,
    awayScore: 1,
    date: '2026-06-07',
    time: '14:30',
    status: 'ongoing',
  },
  {
    id: '2',
    homeTeam: 'Jannik Sinner',
    awayTeam: 'Daniil Medvedev',
    homeScore: 1,
    awayScore: 0,
    date: '2026-06-07',
    time: '12:00',
    status: 'ongoing',
  },
  {
    id: '3',
    homeTeam: 'Aryna Sabalenka',
    awayTeam: 'Iga Swiatek',
    homeScore: 0,
    awayScore: 1,
    date: '2026-06-07',
    time: '16:00',
    status: 'finished',
  },
]

export default function useSportsData(tournamentId) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)

      // Using mock data for now - TheSportsDB free API has limitations
      // In production, you'd use: https://www.thesportsdb.com/api/v1/eventslast.php?id={tournamentId}

      setGames(MOCK_GAMES)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
    const interval = setInterval(fetchGames, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [tournamentId])

  return { games, loading, lastUpdate, error }
}
