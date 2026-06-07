import { useState, useEffect } from 'react'

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/tennis'

export function useESPNTennis() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const fetchTennisMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      // Formato para a API ESPN: YYYYMMDD
      const dateFormatted = selectedDate.replace(/-/g, '')

      // Buscar dados de ambas as ligas
      const [atpResponse, wtaResponse] = await Promise.all([
        fetch(`${ESPN_API_BASE}/atp/scoreboard?dates=${dateFormatted}`),
        fetch(`${ESPN_API_BASE}/wta/scoreboard?dates=${dateFormatted}`)
      ])

      if (!atpResponse.ok || !wtaResponse.ok) {
        throw new Error('Failed to fetch ESPN tennis data')
      }

      const atpData = await atpResponse.json()
      const wtaData = await wtaResponse.json()

      // Processar eventos de ambas as ligas
      const allEvents = [
        ...(atpData.events || []).map(e => ({ ...e, league: 'ATP' })),
        ...(wtaData.events || []).map(e => ({ ...e, league: 'WTA' }))
      ]

      // Agrupar por torneio
      const tournamentMap = new Map()

      allEvents.forEach(event => {
        if (!event.competitions || event.competitions.length === 0) return

        const competition = event.competitions[0]
        const tournamentName = competition.tournament?.name || 'Unknown Tournament'
        const tournamentId = competition.tournament?.id || 'unknown'

        if (!tournamentMap.has(tournamentId)) {
          tournamentMap.set(tournamentId, {
            id: tournamentId,
            name: tournamentName,
            league: event.league,
            emoji: getEmoji(tournamentName),
            matches: [],
            liveCount: 0,
            finishedCount: 0,
          })
        }

        const tournament = tournamentMap.get(tournamentId)
        const status = event.status?.toLowerCase() || 'scheduled'

        // Extrair dados dos competidores
        const competitors = competition.competitors || []
        let homeTeam = ''
        let awayTeam = ''
        let homeScore = 0
        let awayScore = 0

        if (competitors.length >= 2) {
          const home = competitors[0]
          const away = competitors[1]

          homeTeam = home.athlete?.displayName || home.team?.displayName || 'Player 1'
          awayTeam = away.athlete?.displayName || away.team?.displayName || 'Player 2'

          // Extrair scores
          homeScore = parseInt(home.score || 0)
          awayScore = parseInt(away.score || 0)
        }

        // Converter status ESPN para nosso padrão
        let matchStatus = 'scheduled'
        if (status.includes('in progress') || status.includes('live')) {
          matchStatus = 'ongoing'
        } else if (status.includes('final') || status.includes('completed') || status.includes('finished')) {
          matchStatus = 'finished'
        }

        tournament.matches.push({
          id: event.id,
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          homeScore: homeScore,
          awayScore: awayScore,
          date: event.date || selectedDate,
          time: event.links?.[0]?.text || 'TBA',
          status: matchStatus,
          type: event.league.toLowerCase(),
          court: competition.venue?.fullName || 'Unknown Venue',
          sets: {
            homeWon: homeScore,
            awayWon: awayScore,
            current: 0,
          },
          points: {
            home: 0,
            away: 0,
            homeGames: 0,
            awayGames: 0,
          },
        })

        // Contar status
        if (matchStatus === 'ongoing') {
          tournament.liveCount++
        } else {
          tournament.finishedCount++
        }
      })

      // Converter para array e ordenar
      const tournamentList = Array.from(tournamentMap.values())
        .sort((a, b) => {
          if (b.liveCount !== a.liveCount) return b.liveCount - a.liveCount
          return b.matches.length - a.matches.length
        })

      console.log('ESPN Tennis Data:', {
        date: selectedDate,
        tournaments: tournamentList.length,
        matches: tournamentList.reduce((sum, t) => sum + t.matches.length, 0),
        live: tournamentList.reduce((sum, t) => sum + t.liveCount, 0),
      })

      setTournaments(tournamentList)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      console.error('Error fetching ESPN tennis:', err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados quando a data selecionada mudar
  useEffect(() => {
    fetchTennisMatches()
  }, [selectedDate])

  // Auto-refresh a cada 60 segundos
  useEffect(() => {
    const interval = setInterval(fetchTennisMatches, 60000)
    return () => clearInterval(interval)
  }, [selectedDate])

  return {
    tournaments,
    loading,
    error,
    lastUpdate,
    selectedDate,
    setSelectedDate,
    refetch: fetchTennisMatches,
  }
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
