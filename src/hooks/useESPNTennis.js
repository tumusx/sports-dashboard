import { useState, useEffect, useCallback } from 'react'

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/tennis'

export function useESPNTennis() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const fetchTennisMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Formato para a API ESPN: YYYYMMDD (apenas a data, sem range)
      const dateFormatted = selectedDate.replace(/-/g, '')

      console.log('Fetching ESPN data for date:', selectedDate, 'formatted:', dateFormatted)

      // Buscar ATP e WTA
      const [atpResponse, wtaResponse] = await Promise.all([
        fetch(`${ESPN_API_BASE}/atp/scoreboard?dates=${dateFormatted}`),
        fetch(`${ESPN_API_BASE}/wta/scoreboard?dates=${dateFormatted}`)
      ])

      if (!atpResponse.ok || !wtaResponse.ok) {
        throw new Error('Failed to fetch ESPN tennis data')
      }

      const atpData = await atpResponse.json()
      const wtaData = await wtaResponse.json()

      // Processar eventos de ATP e WTA
      const atpEvents = (atpData.events || []).map(e => ({ ...e, league: 'ATP' }))
      const wtaEvents = (wtaData.events || []).map(e => ({ ...e, league: 'WTA' }))
      const allEvents = [...atpEvents, ...wtaEvents]

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
            let homeAthleteId = undefined
            let awayAthleteId = undefined

            if (competitors.length >= 2) {
              const home = competitors[0]
              const away = competitors[1]


              homeTeam = home.athlete?.displayName || home.athlete?.fullName
              awayTeam = away.athlete?.displayName || away.athlete?.fullName

              // Pular competições sem nomes (duplos/outras categorias)
              if (!homeTeam || !awayTeam) return

              // Extrair dados dos atletas (bandeiras, país, ID)
              homeAthleteFlag = home.athlete?.flag?.href
              awayAthleteFlag = away.athlete?.flag?.href
              homeAthleteId = home.id
              awayAthleteId = away.id


              // Sets ganhos = quantidade de linescores com winner === true.
              // (ESPN tennis NÃO entrega competitor.score — sempre null)
              if (home.linescores && away.linescores) {
                homeScore = home.linescores.filter(s => s.winner === true).length
                awayScore = away.linescores.filter(s => s.winner === true).length
              }

              if (statusType === 'in') {
                console.log(`[LIVE] ${homeTeam} vs ${awayTeam}`, {
                  setsWon: `${homeScore}-${awayScore}`,
                  homeLine: home.linescores,
                  awayLine: away.linescores,
                  serving: home.possession === true ? 'home' : away.possession === true ? 'away' : 'unknown',
                })
              }
            }

            // Extrair linescores para mostrar score completo
            const homeLinescores = competitors[0]?.linescores || []
            const awayLinescores = competitors[1]?.linescores || []

            // Games no set atual = value do último linescore (set em andamento, sem winner)
            const homeCurrentGames = homeLinescores[homeLinescores.length - 1]?.value ?? 0
            const awayCurrentGames = awayLinescores[awayLinescores.length - 1]?.value ?? 0

            // Indicador de saque
            const homeServing = competitors[0]?.possession === true
            const awayServing = competitors[1]?.possession === true

            // Texto descritivo (ex: "X is tied with Y 5-7 4-0") e label do set
            const summaryNote = (competition.notes || []).find(n => n.text)?.text || null
            const setLabel = competition.status?.type?.detail || competition.status?.type?.shortDetail || null

            // Detectar tipo: se event.league é ATP mas tem nomes femininos, marcar como WTA
            // Nomes femininos comuns em tênis
            const femaleNames = ['Maja', 'Diana', 'Anna', 'Aryna', 'Katie', 'Ajla', 'Linda', 'Tatjana', 'Maddison', 'Celine', 'Himeno', 'Ashlyn', 'Lisa', 'Darya', 'Dang', 'Laura', 'Sofia', 'Tatiana', 'Nika', 'Chloe', 'Tyra', 'Varvara']
            let matchType = event.league.toLowerCase()

            // Se event.league é ATP mas os nomes parecem femininos, é provavelmente WTA
            if (matchType === 'atp') {
              const isLikelyFemale = femaleNames.some(name => homeTeam?.includes(name) || awayTeam?.includes(name))
              if (isLikelyFemale) {
                matchType = 'wta'
                console.log(`[AUTO-DETECT] ${homeTeam} vs ${awayTeam}: Detectado como WTA (event.league era ATP)`)
              }
            }

            tournament.matches.push({
              id: competition.id,
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              homeAthleteFlag: homeAthleteFlag,
              awayAthleteFlag: awayAthleteFlag,
              homeAthleteId: homeAthleteId,
              awayAthleteId: awayAthleteId,
              homeScore: homeScore,
              awayScore: awayScore,
              date: competition.date || selectedDate,
              time: competition.startDate ? new Date(competition.startDate).toLocaleTimeString() : 'TBA',
              status: matchStatus,
              type: matchType,
              court: competition.venue?.fullName || competition.venue?.court || 'Unknown Court',
              sets: {
                homeWon: homeScore,
                awayWon: awayScore,
                current: Math.max(homeLinescores.length, awayLinescores.length),
              },
              points: {
                home: null,
                away: null,
                homeGames: homeCurrentGames,
                awayGames: awayCurrentGames,
              },
              serving: homeServing ? 'home' : awayServing ? 'away' : null,
              setLabel: setLabel,
              summary: summaryNote,
              lastPlay: null,
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

      // Mesclar tournaments com o mesmo nome (ATP e WTA do mesmo torneio)
      const tournamentsByName = new Map()
      tournamentMap.forEach(tournament => {
        const existing = tournamentsByName.get(tournament.name)
        if (existing) {
          // Mesclar matches
          existing.matches.push(...tournament.matches)
          // Atualizar contagens
          tournament.matches.forEach(m => {
            if (m.status === 'ongoing') {
              existing.liveCount++
            } else {
              existing.finishedCount++
            }
          })
          // Combinar leagues
          if (existing.league !== tournament.league) {
            existing.league = 'ATP/WTA'
          }
        } else {
          tournamentsByName.set(tournament.name, tournament)
        }
      })

      // Converter para array e ordenar
      const tournamentList = Array.from(tournamentsByName.values())
        .sort((a, b) => {
          if (b.liveCount !== a.liveCount) return b.liveCount - a.liveCount
          return b.matches.length - a.matches.length
        })

      // Log types distribution
      const typeCounts = {}
      tournamentList.forEach(t => {
        t.matches.forEach(m => {
          typeCounts[m.type] = (typeCounts[m.type] || 0) + 1
        })
      })

      console.log('ESPN Tennis Data:', {
        date: selectedDate,
        tournaments: tournamentList.length,
        matches: tournamentList.reduce((sum, t) => sum + t.matches.length, 0),
        live: tournamentList.reduce((sum, t) => sum + t.liveCount, 0),
        typeDistribution: typeCounts,
      })

      setTournaments(tournamentList)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      console.error('Error fetching ESPN tennis:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Buscar dados quando a data selecionada mudar
  useEffect(() => {
    fetchTennisMatches()
  }, [fetchTennisMatches])

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
