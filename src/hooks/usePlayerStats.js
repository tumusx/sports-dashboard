import { useState } from 'react'

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/tennis/leagues'

// Helper para garantir HTTPS em URLs da API
const ensureHttps = (url) => url?.replace('http://', 'https://')

export function usePlayerStats() {
  const [playerStats, setPlayerStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlayerStats = async (athleteId, league) => {
    if (!athleteId || !league) {
      setError('Missing athlete ID or league')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${CORE_API_BASE}/${league}/athletes/${athleteId}?lang=en&region=us`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch player stats')
      }

      const data = await response.json()

      let stats = {
        id: data.id,
        displayName: data.displayName,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        hand: data.hand?.displayValue,
        height: data.displayHeight,
        experience: data.experience?.years,
        birthPlace: data.birthPlace?.summary,
        wins: 0,
        losses: 0,
        titles: 0,
        doublesTitles: 0,
        prize: 0,
      }

      // Fetch statistics
      if (data.statistics?.$ref) {
        try {
          const statsUrl = ensureHttps(data.statistics.$ref)
          const statsResponse = await fetch(statsUrl)
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()

            // Extrair stats de splits.categories[0].stats
            if (statsData.splits?.categories?.[0]?.stats) {
              const statsList = statsData.splits.categories[0].stats

              statsList.forEach(s => {
                if (s.name === 'singlesWon') stats.wins = parseInt(s.value) || 0
                if (s.name === 'singlesLost') stats.losses = parseInt(s.value) || 0
                if (s.name === 'singlesTitles') stats.titles = parseInt(s.value) || 0
                if (s.name === 'doublesTitles') stats.doublesTitles = parseInt(s.value) || 0
                if (s.name === 'prize') stats.prize = parseInt(s.value) || 0
              })

              stats.allStats = statsList
            }
          }
        } catch (err) {
          console.error('Error fetching statistics details:', err)
        }
      }

      setPlayerStats(stats)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching player stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setPlayerStats(null)
    setError(null)
  }

  return {
    playerStats,
    loading,
    error,
    fetchPlayerStats,
    clear,
  }
}
