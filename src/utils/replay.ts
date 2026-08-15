import { Country, GameMode, ReplayData, ReplayEvent, SeriesMode, ArenaTheme } from '../types';

export class ReplayRecorder {
  private events: ReplayEvent[] = [];
  private startTime: number = 0;
  private battleId: string = '';
  private mode: GameMode = 'normal';
  private seriesMode: SeriesMode = 3;
  private arenaTheme: ArenaTheme = 'cyber';
  private countries: Country[] = [];

  public startRecording(
    battleId: string,
    mode: GameMode,
    seriesMode: SeriesMode,
    arenaTheme: ArenaTheme,
    countries: Country[]
  ) {
    this.battleId = battleId;
    this.mode = mode;
    this.seriesMode = seriesMode;
    this.arenaTheme = arenaTheme;
    this.countries = countries;
    this.startTime = Date.now();
    this.events = [];
    
    this.addEvent('spawn', { countries });
  }

  public addEvent(type: ReplayEvent['type'], data: any) {
    const time = (Date.now() - this.startTime) / 1000; // time in seconds
    this.events.push({ time, type, data });
  }

  public finishRecording(winner: Country): ReplayData {
    const durationSeconds = (Date.now() - this.startTime) / 1000;
    this.addEvent('winner', { winner });

    return {
      battleId: this.battleId,
      mode: this.mode,
      seriesMode: this.seriesMode,
      arenaTheme: this.arenaTheme,
      countries: this.countries,
      winner,
      durationSeconds,
      events: this.events,
    };
  }
}

export const globalReplayRecorder = new ReplayRecorder();
