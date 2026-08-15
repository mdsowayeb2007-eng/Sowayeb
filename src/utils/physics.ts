import { Country, FlagPhysicsObject, PowerUpItem, SpecialEvent } from '../types';

export interface ArenaConfig {
  centerX: number;
  centerY: number;
  radius: number;
  gapOpen: boolean;
  gapStartAngle: number; // in radians
  gapEndAngle: number;   // in radians
  gapOpeningProgress: number; // 0 to 1
  rotationAngle: number;
  theme: 'space' | 'cyber' | 'lava' | 'ocean';
}

export function createFlagObject(
  country: Country,
  x: number,
  y: number,
  radius: number = 11
): FlagPhysicsObject {
  // Give random high initial velocity vector for dynamic back-and-forth bouncing
  const angle = Math.random() * Math.PI * 2;
  const speed = 5 + Math.random() * 5;
  
  return {
    id: `flag_${country.code}_${Math.random().toString(36).substring(2, 7)}`,
    country,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    mass: 1.0,
    bounce: 0.98,
    friction: 0.996,
    health: 100,
    maxHealth: 100,
    isEliminated: false,
    shieldActive: false,
    speedBoostDuration: 0,
    powerBoostDuration: 0,
    magnetDuration: 0,
    lightningProtectionDuration: 0,
    killCount: 0,
  };
}

// Spawns flags evenly distributed in a circular grid around arena center
export function spawnFlags(countries: Country[], arena: ArenaConfig, radius: number = 11): FlagPhysicsObject[] {
  const flags: FlagPhysicsObject[] = [];
  const count = countries.length;
  
  // Arrange in concentric rings
  const ringCount = Math.ceil(Math.sqrt(count));
  let placed = 0;

  for (let ring = 0; ring <= ringCount && placed < count; ring++) {
    const ringRadius = ring === 0 ? 0 : ring * (radius * 2.3);
    const maxOnRing = ring === 0 ? 1 : Math.floor((2 * Math.PI * ringRadius) / (radius * 2.3));
    
    for (let i = 0; i < maxOnRing && placed < count; i++) {
      const angle = (i / maxOnRing) * Math.PI * 2 + (ring * 0.2);
      const x = arena.centerX + Math.cos(angle) * ringRadius;
      const y = arena.centerY + Math.sin(angle) * ringRadius;
      
      flags.push(createFlagObject(countries[placed], x, y, radius));
      placed++;
    }
  }

  return flags;
}

// Main Physics Integration Step
export function updatePhysics(
  flags: FlagPhysicsObject[],
  arena: ArenaConfig,
  powerUps: PowerUpItem[],
  activeEvent: SpecialEvent | null,
  dt: number = 1 / 60,
  collisionCallback?: (f1: FlagPhysicsObject, f2: FlagPhysicsObject, damage: number) => void
): { eliminated: FlagPhysicsObject[]; collectedPowerUps: { flag: FlagPhysicsObject; powerUp: PowerUpItem }[] } {
  const eliminated: FlagPhysicsObject[] = [];
  const collectedPowerUps: { flag: FlagPhysicsObject; powerUp: PowerUpItem }[] = [];

  const activeFlags = flags.filter(f => !f.isEliminated);

  // 1. Apply Power-up duration countdowns & Special Event Forces
  activeFlags.forEach(flag => {
    if (flag.speedBoostDuration > 0) flag.speedBoostDuration -= dt;
    if (flag.powerBoostDuration > 0) flag.powerBoostDuration -= dt;
    if (flag.magnetDuration > 0) flag.magnetDuration -= dt;
    if (flag.lightningProtectionDuration > 0) flag.lightningProtectionDuration -= dt;

    // Magnet power-up effect (attract or push other flags)
    if (flag.magnetDuration > 0) {
      activeFlags.forEach(other => {
        if (other.id !== flag.id) {
          const dx = flag.x - other.x;
          const dy = flag.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 10 && dist < 180) {
            const pull = 0.4;
            other.vx += (dx / dist) * pull;
            other.vy += (dy / dist) * pull;
          }
        }
      });
    }

    // Special Event forces (Wind, Vortex, Black Hole)
    if (activeEvent) {
      if (activeEvent.type === 'wind') {
        flag.vx += (activeEvent.vx || 0.3);
        flag.vy += (activeEvent.vy || 0);
      } else if (activeEvent.type === 'vortex' || activeEvent.type === 'black_hole') {
        const cx = activeEvent.x || arena.centerX;
        const cy = activeEvent.y || arena.centerY;
        const dx = cx - flag.x;
        const dy = cy - flag.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          const force = activeEvent.type === 'black_hole' ? 1.2 : 0.4;
          flag.vx += (dx / dist) * force;
          flag.vy += (dy / dist) * force;

          // Black Hole deals continuous tick damage if very close
          if (activeEvent.type === 'black_hole' && dist < 45) {
            flag.health -= 0.2;
          }
        }
      }
    }

    // Movement integration
    flag.x += flag.vx;
    flag.y += flag.vy;

    // Slight centrifugal agitation toward frame wall so flags actively bump against the frame
    const centerDx = flag.x - arena.centerX;
    const centerDy = flag.y - arena.centerY;
    const centerDist = Math.hypot(centerDx, centerDy) || 1;
    if (centerDist > 20) {
      // Gentle outward push towards frame wall
      flag.vx += (centerDx / centerDist) * 0.08;
      flag.vy += (centerDy / centerDist) * 0.08;
    }

    // Ensure minimum speed so flags continuously bounce back and forth across the arena
    const speed = Math.hypot(flag.vx, flag.vy);
    const minSpeed = 3.5;
    const maxSpeed = flag.speedBoostDuration > 0 ? 14 : 10;

    if (speed < minSpeed) {
      const boostDir = speed > 0.01 ? { x: flag.vx / speed, y: flag.vy / speed } : { x: (Math.random() - 0.5), y: (Math.random() - 0.5) };
      flag.vx = boostDir.x * minSpeed;
      flag.vy = boostDir.y * minSpeed;
    } else if (speed > maxSpeed) {
      flag.vx = (flag.vx / speed) * maxSpeed;
      flag.vy = (flag.vy / speed) * maxSpeed;
    }

    flag.vx *= flag.friction;
    flag.vy *= flag.friction;
  });

  // 2. Flag vs Flag Collision Resolution
  for (let i = 0; i < activeFlags.length; i++) {
    for (let j = i + 1; j < activeFlags.length; j++) {
      const f1 = activeFlags[i];
      const f2 = activeFlags[j];

      const dx = f2.x - f1.x;
      const dy = f2.y - f1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = f1.radius + f2.radius;

      if (dist < minDist && dist > 0.0001) {
        // Normal vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const rvx = f2.vx - f1.vx;
        const rvy = f2.vy - f1.vy;
        const velAlongNormal = rvx * nx + rvy * ny;

        // Resolving overlap to prevent sticking
        const overlap = minDist - dist;
        f1.x -= nx * (overlap * 0.5);
        f1.y -= ny * (overlap * 0.5);
        f2.x += nx * (overlap * 0.5);
        f2.y += ny * (overlap * 0.5);

        if (velAlongNormal < 0) {
          let restitution = (f1.bounce + f2.bounce) * 0.5;
          if (activeEvent?.type === 'mega_bounce') {
            restitution = 1.4; // Quadruple bounce!
          }

          const impulseMagnitude = -(1 + restitution) * velAlongNormal / (1 / f1.mass + 1 / f2.mass);

          f1.vx -= (impulseMagnitude / f1.mass) * nx;
          f1.vy -= (impulseMagnitude / f1.mass) * ny;
          f2.vx += (impulseMagnitude / f2.mass) * nx;
          f2.vy += (impulseMagnitude / f2.mass) * ny;

          // Impulse velocity transfer on elastic collision (no health damage or popping)
          const collisionSpeed = Math.abs(velAlongNormal);

          if (collisionCallback) {
            collisionCallback(f1, f2, collisionSpeed);
          }
        }
      }
    }
  }

  // 3. Arena Boundary Collision & Gap Elimination
  activeFlags.forEach(flag => {
    const dx = flag.x - arena.centerX;
    const dy = flag.y - arena.centerY;
    const distFromCenter = Math.hypot(dx, dy);

    if (distFromCenter + flag.radius > arena.radius) {
      // Check angle relative to center
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;

      // Check if angle is inside open gap
      let inGap = false;
      if (arena.gapOpen) {
        let gStart = (arena.gapStartAngle + arena.rotationAngle) % (Math.PI * 2);
        let gEnd = (arena.gapEndAngle + arena.rotationAngle) % (Math.PI * 2);
        if (gStart < 0) gStart += Math.PI * 2;
        if (gEnd < 0) gEnd += Math.PI * 2;

        if (gStart < gEnd) {
          inGap = angle >= gStart && angle <= gEnd;
        } else {
          inGap = angle >= gStart || angle <= gEnd;
        }
      }

      if (inGap) {
        // Flag falls out through the frame cutout gap!
        const nx = dx / distFromCenter;
        const ny = dy / distFromCenter;
        // Tangential speed from spinning frame + radial outward momentum
        flag.vx += nx * 0.8 + (-ny * 0.4);
        flag.vy += ny * 0.8 + (nx * 0.4);

        if (distFromCenter > arena.radius + flag.radius + 4) {
          flag.isEliminated = true;
          flag.eliminatedAt = Date.now();
          eliminated.push(flag);
        }
      } else {
        // Bounce off solid arena circular frame wall
        const nx = dx / distFromCenter;
        const ny = dy / distFromCenter;

        // Position correction back inside the frame
        flag.x = arena.centerX + nx * (arena.radius - flag.radius - 1);
        flag.y = arena.centerY + ny * (arena.radius - flag.radius - 1);

        // Reflect velocity vector along normal
        const dot = flag.vx * nx + flag.vy * ny;
        if (dot > 0) {
          flag.vx -= (1 + flag.bounce) * dot * nx;
          flag.vy -= (1 + flag.bounce) * dot * ny;
        }

        // Tangential kick from the spinning frame wall (drags flag along rotation direction)
        const frameTangentialSpeed = 1.2;
        const tx = -ny; // Tangential normal perpendicular vector
        const ty = nx;
        flag.vx += tx * frameTangentialSpeed * 0.2;
        flag.vy += ty * frameTangentialSpeed * 0.2;
      }
    }

    // Note: Flags only get eliminated when falling out through the frame cutout gap!
  });

  // 4. Power-Up Pickups Check
  powerUps.forEach(p => {
    if (!p.active) return;
    activeFlags.forEach(flag => {
      const dist = Math.hypot(flag.x - p.x, flag.y - p.y);
      if (dist < flag.radius + p.radius) {
        p.active = false;
        // Apply powerup
        if (p.type === 'shield') flag.shieldActive = true;
        else if (p.type === 'speed') flag.speedBoostDuration = p.duration;
        else if (p.type === 'power') flag.powerBoostDuration = p.duration;
        else if (p.type === 'heal') flag.health = Math.min(flag.maxHealth, flag.health + 35);
        else if (p.type === 'magnet') flag.magnetDuration = p.duration;
        else if (p.type === 'lightning_protection') flag.lightningProtectionDuration = p.duration;

        collectedPowerUps.push({ flag, powerUp: p });
      }
    });
  });

  return { eliminated, collectedPowerUps };
}
