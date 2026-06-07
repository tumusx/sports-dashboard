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

      // Formato para a API ESPN: YYYYMMDD (apenas a data, sem range)
      const dateFormatted = selectedDate.replace(/-/g, '')

      console.log('Fetching ESPN data for date:', selectedDate, 'formatted:', dateFormatted)

      // Buscar apenas ATP por enquanto (evita duplicação)
      const atpResponse = await fetch(`${ESPN_API_BASE}/atp/scoreboard?dates=${dateFormatted}`)

      if (!atpResponse.ok) {
        throw new Error('Failed to fetch ESPN tennis data')
      }

      const atpData = await atpResponse.json()

      // Processar eventos de ATP
      const allEvents = (atpData.events || []).map(e => ({ ...e, league: 'ATP' }))

      // Agrupar por torneio
      const tournamentMap = new Map()
      const seenCompetitions = new Set() // Evitar duplicatas

      allEvents.forEach(event => {
        // Estrutura: event.groupings[].competitions[]
        if (!event.groupings || event.groupings.length === 0) return

        event.groupings.forEach(grouping => {
          if (!grouping.competitions || grouping.competitions.length === 0) return

          grouping.competitions.forEach(competition => {
            // Evitar duplicatas
            if (seenCompetitions.has(competition.id)) return
            seenCompetitions.add(competition.id)

            // Filtrar apenas competições do dia selecionado
            const competitionDate = (competition.date || competition.startDate || '').split('T')[0]
            const selectedDateFormatted = selectedDate

            if (competitionDate !== selectedDateFormatted) return

            const tournamentName = event.name || 'Unknown Tournament'
            // Usar event.id como tournamentId
            const tournamentId = event.id || 'unknown'

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

            // Converter status ESPN para nosso padrão
            const statusType = competition.status?.type?.state || 'pre'
            let matchStatus = 'scheduled'
            if (statusType === 'in' || statusType === 'live') {
              matchStatus = 'ongoing'
            } else if (statusType === 'post') {
              matchStatus = 'finished'
            }

            // Extrair dados dos competidores (jogadores)
            const competitors = competition.competitors || []
            let homeTeam = 'Player 1'
            let awayTeam = 'Player 2'
            let homeScore = 0
            let awayScore = 0
            let homeAthleteFlag = undefined
            let awayAthleteFlag = undefined

            if (competitors.length >= 2) {
              const home = competitors[0]
              const away = competitors[1]

              console.log('Home athlete:', home.athlete)
              console.log('Away athlete:', away.athlete)

              homeTeam = home.athlete?.displayName || home.athlete?.fullName
              awayTeam = away.athlete?.displayName || away.athlete?.fullName

              // Pular competições sem nomes (duplos/outras categorias)
              if (!homeTeam || !awayTeam) return

              // Extrair dados dos atletas (bandeiras, país)
              homeAthleteFlag = home.athlete?.flag?.href
              awayAthleteFlag = away.athlete?.flag?.href

              // Em tennis, contar quantos sets cada jogador ganhou
              if (home.linescores && away.linescores) {
                homeScore = home.linescores.filter(s => s.winner).length
                awayScore = away.linescores.filter(s => s.winner).length
              }
            }

            // Extrair linescores para mostrar score completo
            const homeLinescores = competitors[0]?.linescores || []
            const awayLinescores = competitors[1]?.linescores || []

            tournament.matches.push({
              id: competition.id,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              homeAthleteFlag: homeAthleteFlag,
              awayAthleteFlag: awayAthleteFlag,
              homeScore: homeScore,
              awayScore: awayScore,
              date: competition.date || selectedDate,
              time: competition.startDate ? new Date(competition.startDate).toLocaleTimeString() : 'TBA',
              status: matchStatus,
              type: event.league.toLowerCase(),
              court: competition.venue?.fullName || competition.venue?.court || 'Unknown Court',
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
              // Dados detalhados para exibição
              linescores: {
                home: homeLinescores,
                away: awayLinescores,
              },
            })

            // Contar status
            if (matchStatus === 'ongoing') {
              tournament.liveCount++
            } else {
              tournament.finishedCount++
            }
          })
        })
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
