import { useState, useEffect } from 'react'

const API_KEY = '123'
const API_BASE = 'https://www.thesportsdb.com/api/v1/json'

export function useTodayMatches() {
  const [tournaments, setTournaments] = useState([])
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchTodayMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0]

      // Buscar eventos de TENNIS do dia (inclui LIVE + COMPLETED)
      // Free tier endpoint: eventsday.php?d=YYYY-MM-DD&s=Tennis
      const response = await fetch(
        `${API_BASE}/${API_KEY}/eventsday.php?d=${today}&s=Tennis`
      )

      if (!response.ok) throw new Error('Failed to fetch today matches')

      const data = await response.json()
      const results = data.results || []

      // API já filtra Tennis, mas podemos validar
      const tennisMatches = results.filter(event => {
        const sport = event.strSport || ''
        return sport.toLowerCase() === 'tennis' || results.length > 0
      })

      // Agrupar por torneio e categoria
      const tournamentMap = new Map()

      tennisMatches.forEach(match => {
        const tournamentName = match.strEvent || 'Unknown'
        const league = match.strLeague || 'ATP'
        const category = determineTournamentCategory(league)

        if (!tournamentMap.has(tournamentName)) {
          tournamentMap.set(tournamentName, {
            name: tournamentName,
            league: league,
            category: category,
            emoji: getEmoji(tournamentName),
            matches: [],
            liveCount: 0,
            finishedCount: 0,
          })
        }

        const tournament = tournamentMap.get(tournamentName)
        const status = getMatchStatus(match.strStatus)

        tournament.matches.push({
          id: match.idEvent,
          homeTeam: match.strHomeTeam,
          awayTeam: match.strAwayTeam,
          homeScore: parseInt(match.intHomeScore || 0),
          awayScore: parseInt(match.intAwayScore || 0),
          date: match.dateEvent,
          time: match.strTime || '00:00',
          status: status,
          type: determineType(league),
          court: match.strVenue || 'Court',
          sets: parseSetData(match),
          points: parsePointData(match),
        })

        if (status === 'ongoing') {
          tournament.liveCount++
        } else if (status === 'finished') {
          tournament.finishedCount++
        }
      })

      // Converter para array e ordenar
      const tournamentList = Array.from(tournamentMap.values())
        .sort((a, b) => {
          // Torneios com jogos ao vivo primeiro
          if (b.liveCount !== a.liveCount) return b.liveCount - a.liveCount
          // Depois por número total de jogos
          return (b.matches.length) - (a.matches.length)
        })

      setTournaments(tournamentList)
      setAllMatches(tennisMatches)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      console.error('Error fetching today matches:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayMatches()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchTodayMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  return { tournaments, allMatches, loading, error, lastUpdate }
}

function determineTournamentCategory(league) {
  const lower = league.toLowerCase()

  if (lower.includes('grand slam') ||
      lower.includes('australian') ||
      lower.includes('french') ||
      lower.includes('roland') ||
      lower.includes('wimbledon') ||
      lower.includes('us open')) {
    return 'Grand Slam'
  }

  if (lower.includes('masters 1000') ||
      lower.includes('rome') ||
      lower.includes('paris') ||
      lower.includes('shanghai') ||
      lower.includes('cincinnati') ||
      lower.includes('monte carlo') ||
      lower.includes('madrid')) {
    return 'Masters 1000'
  }

  if (lower.includes('atp 500')) {
    return 'ATP 500'
  }

  if (lower.includes('atp 250')) {
    return 'ATP 250'
  }

  return 'ATP'
}

function getEmoji(tournamentName) {
  const lower = tournamentName.toLowerCase()

  if (lower.includes('australian')) return '🦘'
  if (lower.includes('french') || lower.includes('roland')) return '🧡'
  if (lower.includes('wimbledon') || lower.includes('grass')) return '🌱'
  if (lower.includes('us open')) return '🗽'
  if (lower.includes('rome') || lower.includes('italia')) return '🏛️'
  if (lower.includes('paris')) return '🇫🇷'
  if (lower.includes('shanghai')) return '🇨🇳'
  if (lower.includes('cincinnati') || lower.includes('ohio')) return '🏀'
  if (lower.includes('monte carlo')) return '🇲🇨'
  if (lower.includes('madrid')) return '🇪🇸'
  if (lower.includes('finals')) return '👑'
  if (lower.includes('queens') || lower.includes('london')) return '🏖️'

  return '🎾'
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
