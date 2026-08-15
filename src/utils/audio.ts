import { SoundSettings } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings = {
    soundFx: true,
    bgm: false,
    volume: 0.7,
    performanceMode: false,
    soundStyle: 'arcade',
  };
  private isBgmPlaying = false;
  private bgmTimeoutId: any = null;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(newSettings: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.settings.bgm && this.isBgmPlaying) {
      this.stopBgm();
    } else if (this.settings.bgm && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  public getSettings(): SoundSettings {
    return this.settings;
  }

  // 1. Enhanced Collision Sound (Realistic Marble Clicks / Arcade Bounce / Chiptune Pop)
  public playCollision(intensity: number = 0.5) {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const style = this.settings.soundStyle || 'arcade';
      const vol = Math.min(0.9, (0.2 + intensity * 0.6) * this.settings.volume);

      // Random pitch variance for organic non-repetitive audio
      const pitchOffset = (Math.random() - 0.5) * 0.25;

      if (style === 'marble') {
        // Realistic Wooden / Glass Marble Impact Click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        const baseFreq = (350 + intensity * 450) * (1 + pitchOffset);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);

        gain.gain.setValueAtTime(vol * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);

      } else if (style === 'chiptune') {
        // Retro 8-bit Square Bounce
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        const baseFreq = (180 + intensity * 300) * (1 + pitchOffset);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.02);

        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);

      } else {
        // Modern Arcade Punchy Bounce (Default)
        // Dual oscillator (sine impact + sub punch)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        const baseFreq = (220 + intensity * 280) * (1 + pitchOffset);
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(60, now + 0.09);

        osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.09);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.09);
        osc2.stop(now + 0.09);
      }
    } catch (e) {
      // Audio safety
    }
  }

  // 2. Elimination / Escape Sound -> Crisp Arcade Chime / Water Splash
  public playElimination() {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const vol = 0.55 * this.settings.volume;

      // Sparkling descending note combo (3 notes)
      const freqs = [880, 659.25, 440];
      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.04;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.12);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    } catch (e) {
      // ignore
    }
  }

  // 3. Winner Victory Sound -> Triumphant Fanfare
  public playVictory() {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const vol = 0.6 * this.settings.volume;
      // C Major Victory Arpeggio (C4, E4, G4, C5, E5, G5, C6)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.08;
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const isLast = idx === notes.length - 1;
        osc1.type = isLast ? 'triangle' : 'sine';
        osc2.type = 'sawtooth';

        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 1.002, startTime); // Subtle chorus harmony

        const dur = isLast ? 0.8 : 0.18;
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + dur);
        osc2.stop(startTime + dur);
      });
    } catch (e) {
      // ignore
    }
  }

  // 4. Lightning Thunder Impact Sound
  public playThunder() {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const vol = 0.75 * this.settings.volume;

      // Heavy bass drop + Sawtooth crackle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // ignore
    }
  }

  // 5. Countdown Beeps (3, 2, 1 -> FIGHT!)
  public playCountdown(num: number) {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const isFight = num === 0;
      const vol = 0.6 * this.settings.volume;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFight ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFight ? 987.77 : 523.25, now); // B5 vs C5

      const duration = isFight ? 0.45 : 0.16;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // ignore
    }
  }

  // 6. Power-up Chime
  public playPowerUp() {
    if (!this.settings.soundFx) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const vol = 0.5 * this.settings.volume;

      const notes = [440, 554.37, 659.25, 880]; // A C# E A
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.04;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    } catch (e) {
      // ignore
    }
  }

  // Background Music Loop (Catchy Retro Arcade Groove)
  public startBgm() {
    if (this.isBgmPlaying || !this.settings.bgm) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.isBgmPlaying = true;
      
      const runLoop = () => {
        if (!this.isBgmPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const vol = 0.06 * this.settings.volume;

        // Energetic synth chord melody sequence
        const pattern = [
          { freq: 220, delay: 0 },
          { freq: 261.63, delay: 0.25 },
          { freq: 329.63, delay: 0.5 },
          { freq: 392.00, delay: 0.75 },
          { freq: 440, delay: 1.0 },
          { freq: 329.63, delay: 1.25 },
          { freq: 261.63, delay: 1.5 },
          { freq: 220, delay: 1.75 },
        ];

        pattern.forEach((item) => {
          if (!this.ctx || !this.isBgmPlaying) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(item.freq, now + item.delay);

          gain.gain.setValueAtTime(vol, now + item.delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + item.delay + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + item.delay);
          osc.stop(now + item.delay + 0.2);
        });

        this.bgmTimeoutId = setTimeout(() => {
          if (this.isBgmPlaying) runLoop();
        }, 2000);
      };

      runLoop();
    } catch (e) {
      // ignore
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId) {
      clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }
}

export const soundManager = new SoundEngine();
