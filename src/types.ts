export interface Country {
  id: string;
  code: string;
  name: string;
  flag: string; // Emoji or SVG fallback
  primaryColor: string;
  secondaryColor: string;
  region: string;
}

export type PowerUpType = 'shield' | 'speed' | 'power' | 'heal' | 'magnet' | 'lightning_protection';

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: PowerUpType;
  duration: number; // in seconds
  active: boolean;
  spawnTime: number;
}

export type SpecialEventType = 'wind' | 'vortex' | 'lightning' | 'speed_boost' | 'mega_bounce' | 'black_hole' | 'none';

export interface SpecialEvent {
  type: SpecialEventType;
  duration: number; // seconds
  message: string;
  x?: number; // center of event (e.g. black hole)
  y?: number;
  vx?: number; // force vector
  vy?: number;
}

export type GameMode = 'normal' | 'lightning' | 'chaos';
export type SeriesMode = number; // First to N wins (1, 3, 5, 10, 15, 20, 25, 50, 100, etc.)
export type ArenaTheme = 'space' | 'cyber' | 'lava' | 'ocean';

export interface FlagPhysicsObject {
  id: string;
  country: Country;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  bounce: number;
  friction: number;
  health: number;
  maxHealth: number;
  isEliminated: boolean;
  eliminatedAt?: number;
  
  // Power-up durations in seconds remaining
  shieldActive: boolean;
  speedBoostDuration: number;
  powerBoostDuration: number;
  magnetDuration: number;
  lightningProtectionDuration: number;
  
  killCount: number;
  lastDamagedById?: string;
}

export interface EliminatedEntry {
  country: Country;
  rank: number;
  eliminatedBy?: Country;
  round: number;
  timestamp: number;
}

export interface BattleState {
  phase: 'setup' | 'countdown' | 'battle' | 'round_end' | 'series_end';
  currentRound: number;
  roundWinner?: Country;
  seriesWinner?: Country;
  seriesScore: Record<string, number>; // countryId -> win count
  eliminatedList: EliminatedEntry[];
  totalEliminated: number;
  countdownSeconds: number;
}

export interface CountryStats {
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

export interface BattleRecord {
  id: string;
  mode: string;
  seriesMode: string;
  arenaTheme: string;
  winnerCountry: { id: string; name: string; flag: string };
  defeatedCount: number;
  durationSeconds: number;
  participantsCount: number;
  createdAt: string;
  topParticipants: { name: string; flag: string; placement: number }[];
}

export interface SoundSettings {
  soundFx: boolean;
  bgm: boolean;
  volume: number; // 0 to 1
  performanceMode: boolean; // Low-end devices
  soundStyle?: 'arcade' | 'marble' | 'chiptune';
}

export interface ReplayEvent {
  time: number;
  type: 'spawn' | 'collision' | 'powerup' | 'eliminated' | 'winner' | 'event';
  data: any;
}

export interface ReplayData {
  battleId: string;
  mode: GameMode;
  seriesMode: SeriesMode;
  arenaTheme: ArenaTheme;
  countries: Country[];
  winner: Country;
  durationSeconds: number;
  events: ReplayEvent[];
}
