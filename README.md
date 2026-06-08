# 🏆 Sports Dashboard

Painel moderno em tempo real para acompanhar partidas de tênis (ATP e WTA), com detalhes de jogadores, placar ao vivo e filtros por torneio.

**Live demo:** https://sports-dashboard-liard.vercel.app

## ✨ Características

- ⚡ Atualização automática a cada 60 segundos (apenas na página LiveScores)
- 🎯 Filtros por torneio, tipo (ATP/WTA) e categoria
- 👤 Modal de detalhes do jogador (wins/losses, títulos, prize money, idade, mão dominante, etc.)
- 📊 Visualização clara de sets (linescores), pontos e status
- 🔄 Toggle entre partidas LIVE e COMPLETED
- 🎨 Design limpo e responsivo (Tailwind CSS)
- 📱 Compatível com desktop e mobile

## 🚀 Como rodar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abra http://localhost:5173 no seu navegador.

### Build para produção

```bash
npm run build
```

## 📋 Estrutura do projeto

```
src/
├── components/
│   ├── GameCard.jsx              # Card de partida (dashboard)
│   ├── LiveScore.jsx             # Card de partida (página LiveScores)
│   ├── PlayerModal.jsx           # Modal com stats do jogador
│   ├── LiveScoresPage.jsx        # Página dedicada com auto-refresh
│   ├── TournamentSelector.jsx    # Seletor de torneio
│   ├── TypeFilter.jsx            # Filtro ATP/WTA/All
│   ├── CategoryFilter.jsx        # Filtro por categoria
│   └── GamesList.jsx             # Grid de cards
├── hooks/
│   ├── useESPNTennis.js          # Busca scoreboard da ESPN Site API
│   └── usePlayerStats.js         # Busca stats do jogador (Core API)
├── App.jsx                       # Roteamento Dashboard ↔ LiveScores
├── App.css
└── index.css                     # Tailwind CSS
```

## 🔌 Integração com a ESPN API

O projeto consome dados públicos da ESPN (sem necessidade de chave de API).

### Site API — Scoreboard de torneios

```javascript
fetch(`https://site.api.espn.com/apis/site/v2/sports/tennis/${league}/scoreboard?dates=${YYYYMMDD}`)
```

- `league`: `atp` ou `wta`
- Retorna estrutura aninhada: `events → groupings → competitions`
- Cada partida inclui: jogadores, IDs dos atletas, scores, linescores (sets), status, bandeiras

### Core API — Detalhes do jogador

```javascript
fetch(`https://sports.core.api.espn.com/v2/sports/tennis/leagues/${league}/athletes/${athleteId}`)
```

Retorna nome, idade, mão dominante, altura, ano em que se tornou profissional, e referências (`$ref`) para estatísticas detalhadas.

### Core API — Estatísticas

```javascript
fetch(`https://sports.core.api.espn.com/v2/sports/tennis/leagues/${league}/athletes/${athleteId}/statistics`)
```

Stats são extraídas de `splits.categories[0].stats`, filtrando pelo campo `name`:
- `singlesWon`, `singlesLost`
- `singlesTitles`, `doublesTitles`
- `prize`

## 🔄 Como funciona

1. **Seleção de torneio** — Lista torneios ATP e WTA do dia
2. **Merge automático** — Mesmo torneio em ATP+WTA é unificado em um único card
3. **Detecção de gênero** — Endpoint ATP às vezes retorna partidas femininas; nomes conhecidos (Aryna, Maja, Diana, etc.) são reclassificados como WTA
4. **Auto-refresh** — Apenas na página LiveScores (a cada 60s) para evitar carga desnecessária na API
5. **Clique no jogador** — Abre modal com stats da Core API (fechável via X, ESC ou clique fora)

## ⚠️ Notas técnicas

### Mixed content (HTTPS)
URLs `$ref` da ESPN Core API vêm como `http://`. Em deploys HTTPS (Vercel), isso bloqueia as requisições. A solução aplicada substitui `http://` por `https://` antes de cada fetch.

### Auto-refresh
Removido do `useESPNTennis` para evitar requests desnecessários no dashboard. Implementado apenas em `LiveScoresPage.jsx` com `setInterval` de 60s.

## 🎯 Roadmap

- [ ] Suportar mais esportes (futebol, basquete)
- [ ] Notificações em tempo real (push) quando partida começar
- [ ] Histórico de confrontos diretos (H2H) entre jogadores
- [ ] Gráficos de performance por temporada

## 🚀 Deploy

Conectado ao Vercel (deploy automático no push para `master`). Tier gratuito é suficiente.

## 📄 Licença

MIT
