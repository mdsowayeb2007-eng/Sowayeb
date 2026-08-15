import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent database store (simulated DB with initial seeding)
interface CountryStats {
  id: string;
  name: string;
  code: string;
  flag: string;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
  eliminationsCount: number;
}

interface BattleRecord {
  id: string;
  mode: string;
  seriesMode: string;
  arenaTheme: string;
  winnerCountry: {
    id: string;
    name: string;
    flag: string;
  };
  defeatedCount: number;
  durationSeconds: number;
  participantsCount: number;
  createdAt: string;
  topParticipants: { name: string; flag: string; placement: number }[];
}

interface VoteRecord {
  countryId: string;
  votes: number;
}

// Initial seed statistics for leaderboard realism
let countryStatsMap: Record<string, CountryStats> = {
  BD: { id: 'BD', name: 'Bangladesh', code: 'BD', flag: '🇧🇩', wins: 152, losses: 97, totalBattles: 249, winRate: 61, bestStreak: 12, currentStreak: 3, eliminationsCount: 840 },
  US: { id: 'US', name: 'USA', code: 'US', flag: '🇺🇸', wins: 141, losses: 106, totalBattles: 247, winRate: 57, bestStreak: 10, currentStreak: 0, eliminationsCount: 910 },
  BR: { id: 'BR', name: 'Brazil', code: 'BR', flag: '🇧🇷', wins: 129, losses: 105, totalBattles: 234, winRate: 55, bestStreak: 8, currentStreak: 1, eliminationsCount: 780 },
  IN: { id: 'IN', name: 'India', code: 'IN', flag: '🇮🇳', wins: 124, losses: 112, totalBattles: 236, winRate: 52, bestStreak: 7, currentStreak: 0, eliminationsCount: 720 },
  JP: { id: 'JP', name: 'Japan', code: 'JP', flag: '🇯🇵', wins: 118, losses: 102, totalBattles: 220, winRate: 53, bestStreak: 9, currentStreak: 2, eliminationsCount: 690 },
  DE: { id: 'DE', name: 'Germany', code: 'DE', flag: '🇩🇪', wins: 110, losses: 100, totalBattles: 210, winRate: 52, bestStreak: 6, currentStreak: 0, eliminationsCount: 650 },
  GB: { id: 'GB', name: 'UK', code: 'GB', flag: '🇬🇧', wins: 105, losses: 103, totalBattles: 208, winRate: 50, bestStreak: 8, currentStreak: 0, eliminationsCount: 610 },
  FR: { id: 'FR', name: 'France', code: 'FR', flag: '🇫🇷', wins: 98, losses: 104, totalBattles: 202, winRate: 48, bestStreak: 5, currentStreak: 0, eliminationsCount: 580 },
  AR: { id: 'AR', name: 'Argentina', code: 'AR', flag: '🇦🇷', wins: 96, losses: 92, totalBattles: 188, winRate: 51, bestStreak: 7, currentStreak: 1, eliminationsCount: 560 },
  ES: { id: 'ES', name: 'Spain', code: 'ES', flag: '🇪🇸', wins: 91, losses: 99, totalBattles: 190, winRate: 47, bestStreak: 6, currentStreak: 0, eliminationsCount: 520 },
};

let globalStats = {
  totalGames: 125492,
  totalRounds: 382104,
  totalWins: 125492,
  totalEliminations: 3842201,
  mostWinningCountry: 'Bangladesh 🇧🇩',
  mostEliminatedCountry: 'USA 🇺🇸',
  highestWinStreak: 14,
};

let battleHistory: BattleRecord[] = [
  {
    id: 'battle_125492',
    mode: 'Chaos 🌪️',
    seriesMode: 'First to 3',
    arenaTheme: 'Cyber',
    winnerCountry: { id: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    defeatedCount: 31,
    durationSeconds: 161,
    participantsCount: 32,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    topParticipants: [
      { name: 'Bangladesh', flag: '🇧🇩', placement: 1 },
      { name: 'USA', flag: '🇺🇸', placement: 2 },
      { name: 'India', flag: '🇮🇳', placement: 3 },
      { name: 'Brazil', flag: '🇧🇷', placement: 4 },
    ]
  },
  {
    id: 'battle_125491',
    mode: 'Lightning ⚡',
    seriesMode: 'First to 3',
    arenaTheme: 'Space',
    winnerCountry: { id: 'US', name: 'USA', flag: '🇺🇸' },
    defeatedCount: 15,
    durationSeconds: 110,
    participantsCount: 16,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    topParticipants: [
      { name: 'USA', flag: '🇺🇸', placement: 1 },
      { name: 'Japan', flag: '🇯🇵', placement: 2 },
      { name: 'Germany', flag: '🇩🇪', placement: 3 },
    ]
  },
  {
    id: 'battle_125490',
    mode: 'Normal 🔵',
    seriesMode: 'First to 1',
    arenaTheme: 'Lava',
    winnerCountry: { id: 'BR', name: 'Brazil', flag: '🇧🇷' },
    defeatedCount: 63,
    durationSeconds: 205,
    participantsCount: 64,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    topParticipants: [
      { name: 'Brazil', flag: '🇧🇷', placement: 1 },
      { name: 'Argentina', flag: '🇦🇷', placement: 2 },
      { name: 'France', flag: '🇫🇷', placement: 3 },
    ]
  }
];

let votesStore: Record<string, Record<string, number>> = {}; // battleId -> { countryId: votes }
let userVotes: Record<string, Record<string, string>> = {}; // session_id -> { battleId: countryId }

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Get Stats
app.get('/api/stats', (req, res) => {
  res.json({
    globalStats,
    countryStats: Object.values(countryStatsMap).sort((a, b) => b.wins - a.wins),
    recentBattles: battleHistory.slice(0, 20)
  });
});

// Get Battle History
app.get('/api/history', (req, res) => {
  res.json({ history: battleHistory });
});

// Get Country Profile
app.get('/api/country/:id', (req, res) => {
  const { id } = req.params;
  const country = countryStatsMap[id];
  if (!country) {
    return res.status(404).json({ error: 'Country stats not found' });
  }
  
  // Find recent matches involving this country
  const countryHistory = battleHistory.filter(b => 
    b.winnerCountry.id === id || b.topParticipants.some(p => p.name.toLowerCase() === country.name.toLowerCase())
  );

  res.json({ country, history: countryHistory });
});

// Record Battle Outcome
app.post('/api/record-battle', (req, res) => {
  const { winnerCountry, participants, mode, seriesMode, arenaTheme, durationSeconds, totalEliminations } = req.body;

  if (!winnerCountry || !winnerCountry.id) {
    return res.status(400).json({ error: 'Winner country data required' });
  }

  // Update Global Stats
  globalStats.totalGames += 1;
  globalStats.totalWins += 1;
  if (totalEliminations) {
    globalStats.totalEliminations += totalEliminations;
  }

  // Update Country Stats for winner
  const winnerId = winnerCountry.id;
  if (!countryStatsMap[winnerId]) {
    countryStatsMap[winnerId] = {
      id: winnerId,
      name: winnerCountry.name,
      code: winnerId,
      flag: winnerCountry.flag || '🏳️',
      wins: 0,
      losses: 0,
      totalBattles: 0,
      winRate: 0,
      bestStreak: 0,
      currentStreak: 0,
      eliminationsCount: 0
    };
  }

  const wStat = countryStatsMap[winnerId];
  wStat.wins += 1;
  wStat.totalBattles += 1;
  wStat.currentStreak += 1;
  if (wStat.currentStreak > wStat.bestStreak) {
    wStat.bestStreak = wStat.currentStreak;
  }
  if (wStat.bestStreak > globalStats.highestWinStreak) {
    globalStats.highestWinStreak = wStat.bestStreak;
  }
  wStat.winRate = Math.round((wStat.wins / wStat.totalBattles) * 100);

  // Update losses for participants
  if (Array.isArray(participants)) {
    participants.forEach((p: any) => {
      const pId = p.id || p.code;
      if (pId && pId !== winnerId) {
        if (!countryStatsMap[pId]) {
          countryStatsMap[pId] = {
            id: pId,
            name: p.name,
            code: pId,
            flag: p.flag || '🏳️',
            wins: 0,
            losses: 0,
            totalBattles: 0,
            winRate: 0,
            bestStreak: 0,
            currentStreak: 0,
            eliminationsCount: 0
          };
        }
        const pStat = countryStatsMap[pId];
        pStat.losses += 1;
        pStat.totalBattles += 1;
        pStat.currentStreak = 0;
        pStat.winRate = Math.round((pStat.wins / pStat.totalBattles) * 100);
      }
    });
  }

  // Find top country name
  const sorted = Object.values(countryStatsMap).sort((a, b) => b.wins - a.wins);
  if (sorted.length > 0) {
    globalStats.mostWinningCountry = `${sorted[0].name} ${sorted[0].flag}`;
  }

  // Create Battle Record
  const newRecord: BattleRecord = {
    id: `battle_${Date.now()}`,
    mode: mode || 'Normal 🔵',
    seriesMode: seriesMode || 'First to 3',
    arenaTheme: arenaTheme || 'Cyber',
    winnerCountry: { id: winnerId, name: winnerCountry.name, flag: winnerCountry.flag || '🏳️' },
    defeatedCount: (participants?.length || 1) - 1,
    durationSeconds: durationSeconds || 120,
    participantsCount: participants?.length || 32,
    createdAt: new Date().toISOString(),
    topParticipants: (participants || []).slice(0, 5).map((p: any, idx: number) => ({
      name: p.name,
      flag: p.flag,
      placement: idx + 1
    }))
  };

  battleHistory.unshift(newRecord);
  if (battleHistory.length > 50) battleHistory.pop();

  res.json({ success: true, battleRecord: newRecord, updatedWinnerStats: wStat });
});

// Vote in a battle
app.post('/api/vote', (req, res) => {
  const { battleId, countryId, sessionId } = req.body;
  if (!battleId || !countryId || !sessionId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (!userVotes[sessionId]) {
    userVotes[sessionId] = {};
  }

  // Allow 1 vote per battle per session
  if (userVotes[sessionId][battleId]) {
    return res.status(400).json({ error: 'You have already voted in this battle!', alreadyVotedCountry: userVotes[sessionId][battleId] });
  }

  userVotes[sessionId][battleId] = countryId;

  if (!votesStore[battleId]) {
    votesStore[battleId] = {};
  }
  votesStore[battleId][countryId] = (votesStore[battleId][countryId] || 0) + 1;

  // Calculate percentage breakdown
  const currentVotes = votesStore[battleId];
  const totalVotes = Object.values(currentVotes).reduce((a, b) => a + b, 0);
  const percentages: Record<string, number> = {};
  Object.keys(currentVotes).forEach(cId => {
    percentages[cId] = Math.round((currentVotes[cId] / totalVotes) * 100);
  });

  res.json({ success: true, totalVotes, percentages, votedCountryId: countryId });
});

// Admin Reset
app.post('/api/admin/reset', (req, res) => {
  battleHistory = [];
  globalStats.totalGames = 0;
  globalStats.totalRounds = 0;
  globalStats.totalWins = 0;
  globalStats.totalEliminations = 0;
  res.json({ success: true, message: 'All battle statistics reset successfully' });
});

async function startServer() {
  // Vite integration in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flag Arena Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
