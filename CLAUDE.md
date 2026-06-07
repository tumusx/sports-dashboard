# Sports Dashboard — Claude Development Guide

## Quick Start
```bash
npm install
npm run dev
# Opens http://localhost:5173
```

## Project Overview
Real-time tennis (ATP/WTA) match dashboard with live score tracking, player stats modal, and match filtering.

**Live demo**: https://sports-dashboard-liard.vercel.app

## Key Concepts

### Data Source: ESPN Site API
- Endpoint: `https://site.api.espn.com/apis/site/v2/sports/tennis/{league}/scoreboard?dates=YYYYMMDD`
- Leagues: `atp`, `wta`
- Returns nested structure: events → groupings → competitions
- Auto-merges ATP/WTA versions of same tournament

### Core Hook: `useESPNTennis`
- Fetches scoreboard for selected date
- Returns: tournaments array with matches grouped by tournament
- Each match contains: players, scores, linescores (sets), flags, athlete IDs, status
- Does NOT auto-refresh (refresh only in LiveScoresPage)

### Player Detail Modal
- Triggered by clicking player name on any card
- Fetches from Core API: `https://sports.core.api.espn.com/v2/sports/tennis/leagues/{league}/athletes/{id}`
- Shows: wins/losses, titles, prize money, age, hand, height, career start year
- Closes: X button, ESC, click outside

## Component Architecture

### Pages
- **App.jsx**: Main dashboard with tournament selector, type/category filters, LIVE/COMPLETED toggle
- **LiveScoresPage.jsx**: Dedicated view for live+finished matches, date/tournament/type filters, auto-refreshes every 60s

### Cards (match display)
- **GameCard.jsx**: Used in App (dashboard)
- **LiveScore.jsx**: Used in LiveScoresPage (more prominent)
- Both: 3-column layout, clickable player names, show linescores (sets)

### Supporting
- **PlayerModal.jsx**: Player stats popup (used by both card types)
- **TypeFilter.jsx**: ATP/WTA/All buttons
- **CategoryFilter.jsx**: Tournament categories
- **GamesList.jsx**: Grid of GameCard components

## Important Patterns

### Gender Detection
ATP endpoint returns both men's and women's matches. Auto-detect women by player names (Maja, Diana, Aryna, etc.) → reassign type='wta'

### Tournament Merging
Same tournament name from ATP+WTA gets merged into single object with combined matches

### HTTPS Requirement
ESPN API $ref URLs come as http://. On HTTPS deployments (Vercel), this blocks requests. Solution: replace http:// → https://

### Auto-Refresh Control
- Removed from useESPNTennis to avoid unnecessary API load
- Only LiveScoresPage implements refresh (every 60s)
- Dashboard fetches once per date change

## Common Tasks

### Add new filter
1. Create useState in App.jsx
2. Add filter component + logic
3. Update filteredMatches useMemo

### Change card styling
Edit GameCard.jsx or LiveScore.jsx (they have same 3-column structure)

### Fetch additional player data
Add to usePlayerStats.js (currently pulls wins/losses/titles/prize from Core API)

### Debug ESPN API structure
Add console.log in useESPNTennis.js when processing events/competitions

## Testing
- Dev server: `npm run dev`
- No unit tests (simple app, visual testing is primary)
- Console logs available in useESPNTennis for data flow debugging

## Deployment
Vercel (connected to GitHub). Auto-deploys on push to master.
Free tier sufficient. Watch for mixed content errors on HTTPS.

## Files to Know
- `src/hooks/useESPNTennis.js` — Core data fetching logic
- `src/hooks/usePlayerStats.js` — Individual player stat fetching
- `src/App.jsx` — Main app routing (Dashboard vs LiveScores)
- `src/components/GameCard.jsx` — Main card component
- `src/components/PlayerModal.jsx` — Player detail popup

---
Created: 2026-06-07 | Last updated during multi-feature implementation (modal, player stats, livescore page)
