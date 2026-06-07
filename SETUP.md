# 🏆 ATP Live Dashboard - Setup Guide

## ✅ Tudo Pronto! 

Seu dashboard está completamente configurado para usar dados reais da API TheSportsDB.

---

## 🚀 Como Usar

### 1. **Iniciar o servidor**
```bash
cd /Users/murilloalvesdasilva/Projects/sports-dashboard
npm run dev
```

Abre automaticamente em: **http://localhost:5173**

---

## 📊 O que você tem agora

### ✨ Funcionalidades
- ✅ **Torneios ATP em LIVE** - Busca automaticamente todos os torneios ao vivo
- ✅ **Seletor dinâmico** - Escolha qual torneio acompanhar
- ✅ **Filtro ATP/WTA** - Mostre apenas o tipo de jogo desejado
- ✅ **Dados em tempo real** - Atualiza a cada 30 segundos
- ✅ **Placar detalhado** - Mostra:
  - 🏆 Sets vencidos/perdidos
  - 🎾 Games vencidos/perdidos  
  - 📍 Pontos atuais do game (0, 15, 30, 40)
- ✅ **Status ao vivo** - Indicadores visuais de jogos em andamento
- ✅ **Court Info** - Mostra a quadra onde o jogo está

---

## 🔌 Integração API

### Endpoint usado
```
GET https://www.thesportsdb.com/api/v1/eventslast.php?id={TOURNAMENT_ID}
```

### Torneios monitorados
- 🦘 Australian Open (ID: 133632)
- 🧡 French Open (ID: 133612)
- 🌱 Wimbledon (ID: 133602)
- 🗽 US Open (ID: 133622)
- 👑 ATP Finals (ID: 135018)

### Rate Limit
- **30 requests/minuto** (free tier)
- Aplicação respeita: 1 request a cada **30 segundos**
- **Totalmente seguro** ✅

---

## 📱 Estrutura do Projeto

```
src/
├── components/
│   ├── GameCard.jsx          # Card com detalhes do jogo
│   ├── GamesList.jsx         # Grid de jogos
│   └── TypeFilter.jsx        # Filtro ATP/WTA
├── hooks/
│   └── useTheSportsDB.js    # Integração API + hooks
├── data/
│   └── tournaments.js        # Dados mockados (backup)
├── App.jsx                   # Componente principal
└── index.css                 # Tailwind CSS
```

---

## 🎯 Como funciona

### 1. App carrega
- Hook `useATPTournaments()` busca todos os torneios em LIVE
- Mostra dropdown com opções disponíveis

### 2. Seleciona torneio
- Hook `useTheSportsDB(tournamentId)` busca todos os jogos
- Filtra por ATP/WTA se desejado
- Atualiza a cada 30 segundos

### 3. Exibe dados
- GameCard mostra:
  ```
  Djokovic
  Sets: 2 | Games: 6 | Pts: 40
  ──────────────────────────
  Alcaraz  
  Sets: 1 | Games: 4 | Pts: 30
  ```

---

## ⚙️ Customização

### Adicionar mais torneios
Editar `src/hooks/useTheSportsDB.js` - array `ATP_TOURNAMENTS`

### Mudar intervalo de update
Editar `src/hooks/useTheSportsDB.js` - linha com `setInterval(fetchGames, 30000)`

### Estilo visual
Editar `src/components/GameCard.jsx` - classes Tailwind

---

## 📦 Deploy (Grátis)

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Fazer upload da pasta 'dist'
```

### Railway
```bash
railway link
railway up
```

---

## 🐛 Troubleshooting

### "No live tournaments found"
- TheSportsDB pode estar offline
- Verifique sua conexão de internet
- Tente: `curl https://www.thesportsdb.com/api/v1/eventslast.php?id=133602`

### API lenta ou com delay
- Normal! TheSportsDB free tier tem delay de minutos
- Não é em tempo real 100% (apenas 30 req/min)

### Pontos não aparecem
- Dados ainda não disponíveis na API
- Aguarde próxima atualização (30 segundos)

---

## 📝 Próximos Passos Opcionais

- [ ] Adicionar mais esportes (futebol, basquete)
- [ ] Histórico de jogos
- [ ] Notificações quando jogador favorito joga
- [ ] Dark/Light theme toggle
- [ ] Estatísticas e histórico H2H
- [ ] WebSocket para atualização em tempo real

---

## 📄 Licença

MIT - Use livremente! 🎉
