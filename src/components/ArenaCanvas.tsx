import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Zap, Flame, Vote, Trophy, FastForward } from 'lucide-react';
import { Country, GameMode, SeriesMode, ArenaTheme, FlagPhysicsObject, PowerUpItem, SpecialEvent, EliminatedEntry, BattleState, SoundSettings } from '../types';
import { ArenaConfig, spawnFlags, updatePhysics } from '../utils/physics';
import { soundManager } from '../utils/audio';
import { globalReplayRecorder } from '../utils/replay';

interface ArenaCanvasProps {
  countries: Country[];
  gameMode: GameMode;
  seriesMode: SeriesMode;
  arenaTheme: ArenaTheme;
  soundSettings: SoundSettings;
  onBattleFinish: (winner: Country, seriesScore: Record<string, number>, duration: number) => void;
  onExit: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  countries,
  gameMode,
  seriesMode,
  arenaTheme,
  soundSettings,
  onBattleFinish,
  onExit,
  isPaused: propIsPaused,
  onTogglePause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Battle State
  const [battleState, setBattleState] = useState<BattleState>({
    phase: 'countdown',
    currentRound: 1,
    seriesScore: {},
    eliminatedList: [],
    totalEliminated: 0,
    countdownSeconds: 3,
  });

  const [internalIsPaused, setInternalIsPaused] = useState<boolean>(false);
  const isPaused = propIsPaused !== undefined ? propIsPaused : internalIsPaused;
  const togglePause = onTogglePause || (() => setInternalIsPaused(p => !p));
  const [activeEvent, setActiveEvent] = useState<SpecialEvent | null>(null);
  const [userVotedCountryId, setUserVotedCountryId] = useState<string | null>(null);
  const [votePercentages, setVotePercentages] = useState<Record<string, number>>({});
  const [winnersList, setWinnersList] = useState<{ country: Country; round: number; wins: number }[]>([]);

  // Mutable Physics Refs for smooth 60 FPS animation loop
  const flagsRef = useRef<FlagPhysicsObject[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const arenaRef = useRef<ArenaConfig>({
    centerX: 300,
    centerY: 300,
    radius: 250,
    gapOpen: false,
    gapStartAngle: Math.PI * 0.2,
    gapEndAngle: Math.PI * 0.5,
    gapOpeningProgress: 0,
    rotationAngle: 0,
    theme: arenaTheme,
  });

  const roundStartTimeRef = useRef<number>(Date.now());
  const seriesScoreRef = useRef<Record<string, number>>({});
  const currentRoundRef = useRef<number>(1);
  const isBattleFinishedRef = useRef<boolean>(false);

  // Initialize Round
  const initRound = (roundNum: number) => {
    const width = containerRef.current?.clientWidth || 600;
    const height = containerRef.current?.clientHeight || 600;
    const radius = Math.min(width, height) * 0.42;

    arenaRef.current = {
      centerX: width / 2,
      centerY: height / 2,
      radius,
      gapOpen: true,
      gapStartAngle: 0,
      gapEndAngle: Math.PI * 0.18,
      gapOpeningProgress: 1,
      rotationAngle: 0,
      theme: arenaTheme,
    };

    // Smaller flag size (radius ~9-13) so flags fit smoothly and roll out through frame gap
    flagsRef.current = spawnFlags(countries, arenaRef.current, Math.max(9, Math.min(13, 160 / Math.sqrt(countries.length))));
    powerUpsRef.current = [];
    particlesRef.current = [];
    roundStartTimeRef.current = Date.now();
    setActiveEvent(null);
    if (roundNum === 1) {
      setWinnersList([]);
    }

    setBattleState(prev => ({
      ...prev,
      phase: 'countdown',
      currentRound: roundNum,
      eliminatedList: [],
      totalEliminated: 0,
      countdownSeconds: 3,
    }));

    // Start Recording replay
    globalReplayRecorder.startRecording(`battle_rnd_${roundNum}`, gameMode, seriesMode, arenaTheme, countries);
  };

  // Setup initial battle on mount
  useEffect(() => {
    // Init scores
    const initialScores: Record<string, number> = {};
    countries.forEach(c => (initialScores[c.id] = 0));
    seriesScoreRef.current = initialScores;
    currentRoundRef.current = 1;

    initRound(1);
  }, [countries, gameMode, seriesMode, arenaTheme]);

  // Countdown timer logic
  useEffect(() => {
    if (battleState.phase !== 'countdown') return;

    soundManager.playCountdown(battleState.countdownSeconds);

    const timer = setInterval(() => {
      setBattleState(prev => {
        if (prev.countdownSeconds <= 1) {
          clearInterval(timer);
          soundManager.playCountdown(0); // FIGHT!
          return { ...prev, phase: 'battle', countdownSeconds: 0 };
        }
        soundManager.playCountdown(prev.countdownSeconds - 1);
        return { ...prev, countdownSeconds: prev.countdownSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleState.phase]);

  // Power-Up Spawning Loop
  useEffect(() => {
    if (battleState.phase !== 'battle' || isPaused) return;

    const interval = setInterval(() => {
      if (powerUpsRef.current.length < 3) {
        const types: PowerUpItem['type'][] = ['shield', 'speed', 'power', 'heal', 'magnet', 'lightning_protection'];
        const type = types[Math.floor(Math.random() * types.length)];
        const arena = arenaRef.current;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (arena.radius * 0.7);

        powerUpsRef.current.push({
          id: `pu_${Date.now()}_${Math.random()}`,
          x: arena.centerX + Math.cos(angle) * dist,
          y: arena.centerY + Math.sin(angle) * dist,
          radius: 12,
          type,
          duration: 6,
          active: true,
          spawnTime: Date.now(),
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [battleState.phase, isPaused]);

  // Special Events Engine (Lightning / Chaos mode)
  useEffect(() => {
    if (battleState.phase !== 'battle' || isPaused) return;

    const interval = setInterval(() => {
      if (gameMode === 'lightning') {
        // Trigger Lightning Event
        soundManager.playThunder();
        setActiveEvent({
          type: 'lightning',
          duration: 2.5,
          message: '⚡ LIGHTNING STRIKE INCAMING!',
        });

        // Strike random non-eliminated flag
        const activeFlags = flagsRef.current.filter(f => !f.isEliminated);
        if (activeFlags.length > 0) {
          const target = activeFlags[Math.floor(Math.random() * activeFlags.length)];
          if (target.shieldActive) {
            target.shieldActive = false;
          } else if (target.lightningProtectionDuration <= 0) {
            target.health -= 35;
          }

          // Create shockwave particles
          for (let k = 0; k < 20; k++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            particlesRef.current.push({
              x: target.x,
              y: target.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              radius: 3 + Math.random() * 3,
              color: '#38bdf8',
              alpha: 1,
              life: 0,
              maxLife: 25,
            });
          }
        }
      } else if (gameMode === 'chaos') {
        const events: SpecialEvent['type'][] = ['wind', 'vortex', 'black_hole', 'mega_bounce', 'lightning'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        const arena = arenaRef.current;

        let msg = '';
        if (chosen === 'wind') msg = '💨 CHAOS WIND BLOWING!';
        else if (chosen === 'vortex') msg = '🌀 GRAVITY VORTEX ACTIVATED!';
        else if (chosen === 'black_hole') msg = '🌑 BLACK HOLE ZONE OPENED!';
        else if (chosen === 'mega_bounce') msg = '💥 MEGA BOUNCE ENABLED!';
        else if (chosen === 'lightning') {
          msg = '⚡ SUDDEN THUNDERSTORM!';
          soundManager.playThunder();
        }

        setActiveEvent({
          type: chosen,
          duration: 5,
          message: msg,
          x: arena.centerX,
          y: arena.centerY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [battleState.phase, gameMode, isPaused]);

  // Main 60 FPS Canvas Physics & Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      if (container) {
        if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          arenaRef.current.centerX = canvas.width / 2;
          arenaRef.current.centerY = canvas.height / 2;
          arenaRef.current.radius = Math.min(canvas.width, canvas.height) * 0.42;
        }
      }

      const { width, height } = canvas;
      const arena = arenaRef.current;

      // 1. Clear background based on Theme
      if (arenaTheme === 'space') {
        ctx.fillStyle = '#050515';
        ctx.fillRect(0, 0, width, height);
      } else if (arenaTheme === 'cyber') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
      } else if (arenaTheme === 'lava') {
        ctx.fillStyle = '#180505';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Ocean
        ctx.fillStyle = '#031124';
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Physics Update Step (only if battle active and not paused)
      if (battleState.phase === 'battle' && !isPaused) {
        const elapsedSec = (Date.now() - roundStartTimeRef.current) / 1000;

        // Rotate arena gap frame continuously
        arena.rotationAngle += 0.012;

        // Update physics
        const { eliminated, collectedPowerUps } = updatePhysics(
          flagsRef.current,
          arena,
          powerUpsRef.current,
          activeEvent,
          1 / 60,
          (f1, f2, damage) => {
            soundManager.playCollision(damage / 15);
            // Spawn collision spark particles
            for (let p = 0; p < Math.min(5, Math.floor(damage)); p++) {
              particlesRef.current.push({
                x: (f1.x + f2.x) / 2,
                y: (f1.y + f2.y) / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 2 + Math.random() * 2,
                color: '#f59e0b',
                alpha: 1,
                life: 0,
                maxLife: 20,
              });
            }
          }
        );

        // Power-Up pickup sound
        if (collectedPowerUps.length > 0) {
          soundManager.playPowerUp();
        }

        // Handle newly eliminated flags
        if (eliminated.length > 0) {
          eliminated.forEach(flag => {
            soundManager.playElimination();

            // Spawn explosion particles
            for (let p = 0; p < 25; p++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 6;
              particlesRef.current.push({
                x: flag.x,
                y: flag.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                radius: 3 + Math.random() * 4,
                color: flag.country.primaryColor || '#f43f5e',
                alpha: 1,
                life: 0,
                maxLife: 35,
              });
            }
          });

          // Update battle state elimination list
          setBattleState(prev => {
            const activeCount = flagsRef.current.filter(f => !f.isEliminated).length;
            const newElims: EliminatedEntry[] = eliminated.map((flag, idx) => ({
              country: flag.country,
              rank: activeCount + eliminated.length - idx,
              round: prev.currentRound,
              timestamp: Date.now(),
            }));

            return {
              ...prev,
              eliminatedList: [...prev.eliminatedList, ...newElims],
              totalEliminated: prev.totalEliminated + eliminated.length,
            };
          });
        }

        // Check Round Winner Condition (1 flag remaining)
        const activeSurvivors = flagsRef.current.filter(f => !f.isEliminated);
        if (activeSurvivors.length <= 1 && !isBattleFinishedRef.current) {
          isBattleFinishedRef.current = true;
          const winnerFlag = activeSurvivors[0] || flagsRef.current[0];
          const roundWinner = winnerFlag.country;

          soundManager.playVictory();

          // Update score
          const currentScore = { ...seriesScoreRef.current };
          currentScore[roundWinner.id] = (currentScore[roundWinner.id] || 0) + 1;
          seriesScoreRef.current = currentScore;

          const isSeriesOver = currentScore[roundWinner.id] >= seriesMode;

          setWinnersList(prev => {
            const newWins = currentScore[roundWinner.id] || 1;
            const filtered = prev.filter(w => w.country.id !== roundWinner.id);
            return [{ country: roundWinner, round: currentRoundRef.current, wins: newWins }, ...filtered];
          });

          setBattleState(prev => ({
            ...prev,
            phase: isSeriesOver ? 'series_end' : 'round_end',
            roundWinner,
            seriesWinner: isSeriesOver ? roundWinner : undefined,
            seriesScore: currentScore,
          }));

          if (isSeriesOver) {
            const duration = Math.round((Date.now() - roundStartTimeRef.current) / 1000);
            onBattleFinish(roundWinner, currentScore, duration);
          } else {
            // Next round after 3.5s delay
            setTimeout(() => {
              isBattleFinishedRef.current = false;
              currentRoundRef.current += 1;
              initRound(currentRoundRef.current);
            }, 3500);
          }
        }
      }

      // 3. Draw Rotating Arena Frame with Cutout Gap
      ctx.save();
      
      const gapStart = arena.gapStartAngle + arena.rotationAngle;
      const gapEnd = arena.gapEndAngle + arena.rotationAngle;

      // Draw main solid frame ring (arc from gapEnd around to gapStart)
      ctx.beginPath();
      ctx.arc(arena.centerX, arena.centerY, arena.radius, gapEnd, gapStart);

      let themeColor = '#06b6d4';
      if (arenaTheme === 'lava') themeColor = '#ef4444';
      else if (arenaTheme === 'space') themeColor = '#a855f7';
      else if (arenaTheme === 'ocean') themeColor = '#3b82f6';

      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 8;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Draw rotating tick marks / frame teeth along perimeter to emphasize frame rotation
      const notchCount = 20;
      for (let i = 0; i < notchCount; i++) {
        const notchAngle = (i / notchCount) * Math.PI * 2 + arena.rotationAngle;
        
        // Normalize angle to check if inside gap
        let gS = (arena.gapStartAngle + arena.rotationAngle) % (Math.PI * 2);
        let gE = (arena.gapEndAngle + arena.rotationAngle) % (Math.PI * 2);
        if (gS < 0) gS += Math.PI * 2;
        if (gE < 0) gE += Math.PI * 2;
        let nAngle = (notchAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

        let inGap = gS < gE ? (nAngle >= gS && nAngle <= gE) : (nAngle >= gS || nAngle <= gE);

        if (!inGap) {
          const innerR = arena.radius - 8;
          const outerR = arena.radius + 6;
          ctx.beginPath();
          ctx.moveTo(arena.centerX + Math.cos(notchAngle) * innerR, arena.centerY + Math.sin(notchAngle) * innerR);
          ctx.lineTo(arena.centerX + Math.cos(notchAngle) * outerR, arena.centerY + Math.sin(notchAngle) * outerR);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // Draw Glowing Danger Caps at both ends of the Frame Cutout Gap
      [gapStart, gapEnd].forEach(edgeAngle => {
        const edgeX = arena.centerX + Math.cos(edgeAngle) * arena.radius;
        const edgeY = arena.centerY + Math.sin(edgeAngle) * arena.radius;

        ctx.beginPath();
        ctx.arc(edgeX, edgeY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      });

      ctx.restore();

      // 4. Render Power-Up Orbs
      powerUpsRef.current.forEach(p => {
        if (!p.active) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        let color = '#38bdf8';
        let icon = '⚡';
        if (p.type === 'shield') { color = '#06b6d4'; icon = '🛡️'; }
        else if (p.type === 'speed') { color = '#f59e0b'; icon = '🚀'; }
        else if (p.type === 'power') { color = '#ef4444'; icon = '💥'; }
        else if (p.type === 'heal') { color = '#10b981'; icon = '❤️'; }
        else if (p.type === 'magnet') { color = '#a855f7'; icon = '🧲'; }

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, p.x, p.y);
        ctx.restore();
      });

      // 5. Render Flags
      flagsRef.current.forEach(flag => {
        if (flag.isEliminated) return;

        ctx.save();

        // Active Power-Up Auras
        if (flag.shieldActive) {
          ctx.beginPath();
          ctx.arc(flag.x, flag.y, flag.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.stroke();
        }

        // Draw Flag Circle Body
        ctx.beginPath();
        ctx.arc(flag.x, flag.y, flag.radius, 0, Math.PI * 2);
        ctx.fillStyle = flag.country.primaryColor || '#1e293b';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Render Country Flag Emoji / Symbol inside
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.floor(flag.radius * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flag.country.flag, flag.x, flag.y);

        ctx.restore();
      });

      // 6. Update and Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [battleState.phase, isPaused, arenaTheme, gameMode, seriesMode]);

  // Vote handler
  const handleVote = (countryId: string) => {
    if (userVotedCountryId) return;
    setUserVotedCountryId(countryId);

    // Call vote API
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        battleId: `battle_rnd_${battleState.currentRound}`,
        countryId,
        sessionId: `session_${Math.random().toString(36).substring(2, 9)}`,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.percentages) {
          setVotePercentages(data.percentages);
        }
      })
      .catch(() => {
        // Fallback local voting
        setVotePercentages({ [countryId]: 100 });
      });
  };

  const activeFlags = flagsRef.current.filter(f => !f.isEliminated);

  return (
    <div className="relative w-full flex-1 h-full min-h-0 bg-slate-950 flex flex-col justify-between overflow-hidden select-none transition-all">
      
      {/* TOP BOX: QUALIFIED FOR FINAL (MATCHING SCREENSHOT) */}
      <div className="w-full max-w-3xl mx-auto px-3 pt-1.5 pb-1 z-20 shrink-0">
        <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md transition-all">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-1 pb-1.5 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-black text-xs sm:text-sm tracking-widest uppercase">
                FINAL WINNERS
              </span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {winnersList.length} WINNERS
            </span>
          </div>

          {/* Qualified / Escaped Flags Cards Grid */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 max-h-[85px] sm:max-h-[110px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/40">
            {winnersList.length === 0 ? (
              <div className="w-full text-center py-2 text-xs text-emerald-400/70 font-semibold italic flex items-center justify-center gap-2">
                <span>🏆 <span>Winning country will be listed here after battle completes</span></span>
              </div>
            ) : (
              winnersList.map((entry, idx) => (
                <div
                  key={`${entry.country.id}_${idx}`}
                  className="bg-slate-900/90 border border-emerald-500/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-100 shadow-lg animate-scale-in shrink-0"
                >
                  <span className="text-amber-400 font-black text-xs">#{idx + 1}</span>
                  <span className="text-base">{entry.country.flag}</span>
                  <span className="font-extrabold text-xs max-w-[110px] truncate">{entry.country.name}</span>
                  {entry.wins > 1 && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/40">
                      {entry.wins} Wins
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

        {/* Sub-Header Ticker */}
        <div className="flex items-center justify-center gap-3 text-xs font-black text-slate-400 pt-1.5">
          <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30 text-[10px]">
            [ QUALIFYING MOD ]
          </span>
          <span className="text-emerald-400 tracking-wider">ROUND {battleState.currentRound}</span>
          <span>•</span>
          <span className="text-slate-300">{activeFlags.length} / {countries.length} REMAINING</span>
        </div>
      </div>

      {/* Main Physics Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-full min-h-0">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* COUNTDOWN OVERLAY */}
        {battleState.phase === 'countdown' && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 space-y-4">
            <div className="text-7xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-400 animate-bounce">
              {battleState.countdownSeconds > 0 ? battleState.countdownSeconds : '🔥 FIGHT!'}
            </div>
            <div className="text-slate-300 font-bold tracking-wider text-sm sm:text-base">
              ROUND {battleState.currentRound} STARTING...
            </div>
          </div>
        )}

        {/* ROUND END WINNER ANNOUNCEMENT */}
        {battleState.phase === 'round_end' && battleState.roundWinner && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-30 space-y-4 text-center animate-fade-in">
            <div className="text-6xl sm:text-8xl">🏆</div>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-200 uppercase tracking-wide">
              ROUND {battleState.currentRound} WINNER!
            </div>
            <div className="text-4xl sm:text-6xl font-black text-rose-400 flex items-center gap-3">
              <span>{battleState.roundWinner.flag}</span>
              <span>{battleState.roundWinner.name}</span>
            </div>
            <div className="text-slate-400 text-sm font-semibold">
              Preparing next round...
            </div>
          </div>
        )}

        {/* RECENT ELIMINATIONS / QUALIFIED FEED ON LEFT SIDE */}
        <div className="absolute left-3 top-4 bottom-4 w-44 sm:w-52 pointer-events-none hidden md:flex flex-col gap-1.5 overflow-hidden justify-end z-10">
          <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider mb-1">
            QUALIFIED LOG ({battleState.eliminatedList.length})
          </div>
          {battleState.eliminatedList.slice(-5).reverse().map((entry, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2 flex items-center justify-between text-xs backdrop-blur animate-slide-in"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{entry.country.flag}</span>
                <span className="font-semibold text-slate-200 truncate max-w-[90px]">{entry.country.name}</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">#{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM HUD: FLAGS COUNT & FULL FLAGS GRID (MATCHING SCREENSHOT) */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-3 py-2 z-20 flex flex-col items-center gap-1.5 shrink-0">
        
        {/* Count Label */}
        <div className="flex items-center gap-2 text-xs font-black text-slate-300">
          <span className="text-emerald-400 text-sm">{activeFlags.length}</span>
          <span>/</span>
          <span>{countries.length} FLAGS IN BATTLE</span>
        </div>

        {/* Flag Row Grid */}
        <div className="w-full overflow-x-auto scrollbar-none flex items-center justify-start sm:justify-center gap-1 py-0.5">
          {countries.map(c => {
            const isAlive = activeFlags.some(f => f.country.id === c.id);
            return (
              <div
                key={c.id}
                className={`px-1 py-0.5 rounded border text-xs sm:text-sm shrink-0 transition-all ${
                  isAlive
                    ? 'bg-slate-900 border-emerald-500/40 text-slate-100 opacity-100 shadow-sm'
                    : 'bg-slate-950 border-slate-900 text-slate-600 opacity-30 grayscale'
                }`}
                title={c.name}
              >
                {c.flag}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
