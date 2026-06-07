# 🏆 Sports Dashboard

Um painel moderno e em tempo real para acompanhar jogos de tênis e outros esportes de determinados campeonatos.

## ✨ Características

- ⚡ Atualização automática a cada 30 segundos
- 🎯 Filtro por torneiro/evento
- 📊 Visualização clara de pontos e status
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
│   ├── TournamentSelector.jsx    # Seletor de campeonatos
│   ├── GamesList.jsx              # Lista de jogos
│   └── GameCard.jsx               # Card individual de jogo
├── hooks/
│   └── useSportsData.js           # Hook para buscar dados da API
├── App.jsx                         # Componente principal
├── App.css                         # Estilos
└── index.css                       # Tailwind CSS
```

## 🔄 Como funciona

1. **Seleção de torneiro**: Escolha entre ATP, WTA ou outro esporte
2. **Auto-refresh**: Dados são atualizados a cada 30 segundos
3. **Status ao vivo**: Indicador visual de jogos em andamento
4. **Placar em tempo real**: Pontos atualizados automaticamente

## 🔌 Integração com API

Atualmente usa dados de exemplo (mock data). Para integrar com dados reais:

### TheSportsDB (Recomendado)

```javascript
// Substituir em useSportsData.js a chamada para:
fetch(`https://www.thesportsdb.com/api/v1/eventslast.php?id=${tournamentId}`)
```

**Limites:**
- 30 requests/minuto (free tier)
- Intervalo recomendado: 30 segundos
- Cobertura: ATP, WTA, Grand Slams

## 📦 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Outras opções
- Netlify
- GitHub Pages
- Railway
- Render

## 🎯 Roadmap

- [ ] Integrar com TheSportsDB API
- [ ] Suportar mais esportes (futebol, basquete, etc)
- [ ] Notificações em tempo real
- [ ] Histórico de jogos
- [ ] Gráficos e estatísticas

## 📝 Notas

- A aplicação respeita o rate limit da API (30 req/min)
- Atualização a cada 30 segundos é ideal para não exceder limites
- Dados podem ter delay de minutos (limitação da API gratuita)

## 📄 Licença

MIT
