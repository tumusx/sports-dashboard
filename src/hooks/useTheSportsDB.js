import { useState, useEffect } from 'react'

// TheSportsDB Free API - 30 requests/minute limit
const API_BASE = 'https://www.thesportsdb.com/api/v1'

// ATP Torneios Oficiais com seus IDs no TheSportsDB
const ATP_TOURNAMENTS = [
  // Grand Slams
  { id: '133632', name: '🦘 Australian Open', emoji: '🦘', category: 'Grand Slam', level: 'Grand Slam' },
  { id: '133612', name: '🧡 French Open', emoji: '🧡', category: 'Grand Slam', level: 'Grand Slam' },
  { id: '133602', name: '🌱 Wimbledon', emoji: '🌱', category: 'Grand Slam', level: 'Grand Slam' },
  { id: '133622', name: '🗽 US Open', emoji: '🗽', category: 'Grand Slam', level: 'Grand Slam' },
  // Masters 1000
  { id: '135018', name: '👑 ATP Finals', emoji: '👑', category: 'Masters 1000', level: 'Masters 1000' },
  { id: '133642', name: '🏛️ Rome Masters', emoji: '🏛️', category: 'Masters 1000', level: 'Masters 1000' },
  { id: '133652', name: '🇫🇷 Paris Masters', emoji: '🇫🇷', category: 'Masters 1000', level: 'Masters 1000' },
  // ATP 500
  { id: '133662', name: '🏖️ ATP 500', emoji: '🏖️', category: 'ATP 500', level: 'ATP 500' },
]

export function useTheSportsDB(tournamentId) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)

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
          time: event.strTime || '00:00',
          status: getMatchStatus(event.strStatus),
          type: determineType(event.strLeague),
          court: event.strVenue || 'Court',
          sets: parseSetData(event),
          points: parsePointData(event),
        }))

        setGames(formattedGames.filter(g => g.status === 'ongoing' || g.status === 'finished'))
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
      const interval = setInterval(fetchGames, 30000)
      return () => clearInterval(interval)
    }
  }, [tournamentId])

  return { games, loading, error, lastUpdate }
}

// Hook para buscar todos os torneios ATP (LIVE + COMPLETED today)
export function useATPTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [hasTodayMatches, setHasTodayMatches] = useState(false)

  const checkTournaments = async () => {
    try {
      setLoading(true)
      const allTournaments = []
      const today = new Date().toISOString().split('T')[0]
      let hasAnyLive = false

      for (const tournament of ATP_TOURNAMENTS) {
        const response = await fetch(
          `${API_BASE}/eventslast.php?id=${tournament.id}`
        )

        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            // Filtrar apenas jogos de hoje (LIVE ou FINISHED)
            const todayMatches = data.results.filter(event => {
              const eventDate = event.dateEvent || ''
              // Normalizar datas YYYYMMDD ou YYYY-MM-DD
              const normalizedDate = eventDate.replace(/-/g, '')
              const todayNormalized = today.replace(/-/g, '')
              return normalizedDate.startsWith(todayNormalized)
            })

            if (todayMatches.length > 0) {
              const liveCount = todayMatches.filter(e =>
                getMatchStatus(e.strStatus) === 'ongoing'
              ).length
              const finishedCount = todayMatches.filter(e =>
                getMatchStatus(e.strStatus) === 'finished'
              ).length

              allTournaments.push({
                id: tournament.id,
                name: tournament.name,
                emoji: tournament.emoji,
                category: tournament.category,
                level: tournament.level,
                gameCount: todayMatches.length,
                liveCount,
                finishedCount,
                status: liveCount > 0 ? 'LIVE' : 'COMPLETED',
              })

              if (liveCount > 0) {
                hasAnyLive = true
              }
            }
          }
        }
      }

      setTournaments(allTournaments)
      setHasTodayMatches(hasAnyLive)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTournaments()
    // Atualizar a cada 30 segundos
    const interval = setInterval(checkTournaments, 30000)
    return () => clearInterval(interval)
  }, [])

  return { tournaments, loading, error, lastUpdate, hasTodayMatches }
}

function getMatchStatus(status) {
  if (!status) return 'pending'
  const lower = status.toLowerCase()
  if (lower.includes('live') || lower.includes('ongoing') || lower.includes('in progress')) return 'ongoing'
  if (lower.includes('finished') || lower.includes('concluded') || lower.includes('ended')) return 'finished'
  return 'pending'
}

function parseSetData(event) {
  const home = parseInt(event.intHomeScore || 0)
  const away = parseInt(event.intAwayScore || 0)
  return {
    homeWon: home,
    awayWon: away,
    current: 0,
  }
}

function parsePointData(event) {
  const homeScore = parseInt(event.intHomeScore || 0)
  const awayScore = parseInt(event.intAwayScore || 0)

  return {
    home: homeScore > 0 ? (homeScore % 4) * 15 : 0,
    away: awayScore > 0 ? (awayScore % 4) * 15 : 0,
    homeGames: Math.floor(homeScore / 4) || 0,
    awayGames: Math.floor(awayScore / 4) || 0,
  }
}

function determineType(league) {
  if (!league) return 'atp'
  const lower = league.toLowerCase()
  if (lower.includes('wta') || lower.includes('women')) return 'wta'
  return 'atp'
}

export const THESPORTSDB_TOURNAMENT_IDS = {
  'australian-open': '133632',
  'french-open': '133612',
  'wimbledon': '133602',
  'us-open': '133622',
  'atp-finals': '135018',
}
