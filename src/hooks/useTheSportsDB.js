import { useState, useEffect } from 'react'

// TheSportsDB Free API - 30 requests/minute limit
const API_BASE = 'https://www.thesportsdb.com/api/v1'

export function useTheSportsDB(tournamentId) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)

      // Para buscar eventos de um evento específico:
      // GET /eventslast.php?id=133602  (Wimbledon 2024)
      // GET /eventslast.php?id=133603  (US Open 2024)

      const response = await fetch(
        `${API_BASE}/eventslast.php?id=${tournamentId}`
      )

      if (!response.ok) throw new Error('Failed to fetch from TheSportsDB')

      const data = await response.json()

      if (data.results) {
        const formattedGames = data.results.map(event => ({
          id: event.idEvent,
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,
          homeScore: parseInt(event.intHomeScore || 0),
          awayScore: parseInt(event.intAwayScore || 0),
          date: event.dateEvent,
          time: event.strTime,
          status: event.strStatus || 'Not Started',
          type: determineType(event.strLeague),
          court: event.strVenue || 'Unknown Court',
        }))

        setGames(formattedGames)
      }
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      console.error('TheSportsDB Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tournamentId) {
      fetchGames()
      // Respeita o rate limit: 30 req/min = 1 req a cada 2 segundos
      // Usar 30 segundos é seguro e permite múltiplas requisições
      const interval = setInterval(fetchGames, 30000)
      return () => clearInterval(interval)
    }
  }, [tournamentId])

  return { games, loading, error, lastUpdate }
}

function determineType(league) {
  if (!league) return 'atp'
  const lower = league.toLowerCase()
  if (lower.includes('wta') || lower.includes('women')) return 'wta'
  return 'atp'
}

// Dicionário de IDs de torneios TheSportsDB
export const THESPORTSDB_TOURNAMENT_IDS = {
  'wimbledon-men': '133602',
  'wimbledon-women': '133603',
  'french-open-men': '133612',
  'french-open-women': '133613',
  'us-open-men': '133622',
  'us-open-women': '133623',
  'australian-open-men': '133632',
  'australian-open-women': '133633',
}
