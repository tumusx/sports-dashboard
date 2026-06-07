import { useState, useEffect } from 'react'

const API_KEY = '123'
const API_BASE = 'https://www.thesportsdb.com/api/v1/json'
// CORS proxy alternativo mais confiável
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

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
      // Usar CORS proxy para contornar bloqueio
      const apiUrl = `${API_BASE}/${API_KEY}/eventsday.php?d=${today}&s=Tennis`
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`

      const response = await fetch(proxyUrl)

      if (!response.ok) throw new Error('Failed to fetch today matches')

      const data = await response.json()
      // API retorna "events" não "results"
      const results = data.events || data.results || []

      console.log('API Response:', { data, results, count: results.length })

      // API já filtra Tennis, mas podemos validar
      const tennisMatches = results.filter(event => {
        const sport = event.strSport || ''
        return sport.toLowerCase() === 'tennis' || results.length > 0
      })

      console.log('Tennis Matches:', { tennisMatches, count: tennisMatches.length })

      // Agrupar por torneio e categoria
      const tournamentMap = new Map()

      tennisMatches.forEach(match => {
        // Parse strEvent para extrair nome do torneio e jogadores
        // Formato: "Tournament Name Player1 vs Player2"
        const eventStr = match.strEvent || 'Unknown'
        const parts = eventStr.split(' vs ')

        let homeTeam = match.strHomeTeam
        let awayTeam = match.strAwayTeam
        let tournamentName = match.strLeague || 'Unknown'

        // Se homeTeam/awayTeam são null, extrair do strEvent
        if (!homeTeam || !awayTeam) {
          if (parts.length === 2) {
            // Extrair jogadores do strEvent
            // "Boss Open Rodionov" vs "Shimabukuro"
            const firstPart = parts[0].trim()
            const secondPart = parts[1].trim()

            // Último word antes de 'vs' é o primeiro jogador
            const words1 = firstPart.split(' ')
            homeTeam = words1[words1.length - 1]

            // Primeiro word após 'vs' é o segundo jogador
            awayTeam = secondPart.split(' ')[0]
          }
        }

        const league = match.strLeague || 'ATP'
        const category = determineTournamentCategory(league)

        if (!tournamentMap.has(tournamentName)) {
          tournamentMap.set(tournamentName, {
            name: tournamentName,
            league: league,
            category: category,
            emoji: getEmoji(eventStr),
            matches: [],
            liveCount: 0,
            finishedCount: 0,
          })
        }

        const tournament = tournamentMap.get(tournamentName)
        const status = getMatchStatus(match.strStatus) || 'scheduled'

        tournament.matches.push({
          id: match.idEvent,
          homeTeam: homeTeam || 'Player 1',
          awayTeam: awayTeam || 'Player 2',
          homeScore: parseInt(match.intHomeScore || 0),
          awayScore: parseInt(match.intAwayScore || 0),
          date: match.dateEvent,
          time: match.strTime || match.strTimeLocal || '00:00',
          status: status,
          type: determineType(league),
          court: match.strVenue || match.strCity || 'Court',
          sets: parseSetData(match),
          points: parsePointData(match),
        })

        // Contar todos os matches, independente do status
        if (status === 'ongoing') {
          tournament.liveCount++
        } else {
          // Contar como 'finished' se não está ao vivo (inclui finished, scheduled, null)
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

      console.log('Tournaments created:', {
        count: tournamentList.length,
        tournaments: tournamentList.map(t => ({
          name: t.name,
          matches: t.matches.length,
          live: t.liveCount,
          finished: t.finishedCount
        }))
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
    // Free tier: 3 req/min = 1 req a cada 20 seg
    // Usar 120 seg (2 min) para ser seguro
    const interval = setInterval(fetchTodayMatches, 120000)
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
