import { useRef, useCallback, useState, useEffect } from 'react';
import { ObstacleType, Position, GameEvent } from './types';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLAYER_RADIUS,
  BASE_SCORE_PER_SECOND,
  BASE_OBSTACLE_RADIUS,
  ARENA_TOP_OFFSET,
  ARENA_BOTTOM_OFFSET,
} from './constants';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);

/** The multiplier steps available when the player presses RISK. */
const MULTIPLIER_STEPS = [1, 1.5, 2, 3, 4];

function spawnObstacleData(survivalTime: number, playerPos: Position): ObstacleType {
  let speedBase = 100;
  if (survivalTime > 60) {
    speedBase = 350 + (survivalTime - 60) * 2;
  } else if (survivalTime > 30) {
    speedBase = 200 + ((survivalTime - 30) / 30) * 150;
  } else if (survivalTime > 10) {
    speedBase = 120 + ((survivalTime - 10) / 20) * 80;
  } else {
    speedBase = 100 + (survivalTime / 10) * 20;
  }
  
  const speed = speedBase + Math.random() * 50;

  const arenaTop = ARENA_TOP_OFFSET;
  const arenaBottom = SCREEN_HEIGHT - ARENA_BOTTOM_OFFSET;
  const SAFE_RADIUS = 150;

  let x = 0, y = 0, vx = 0, vy = 0;

  for (let attempt = 0; attempt < 5; attempt++) {
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      x = PLAYER_RADIUS + Math.random() * (SCREEN_WIDTH - PLAYER_RADIUS * 2);
      y = arenaTop - 40;
      vx = (Math.random() - 0.5) * speed * 0.6;
      vy = speed;
    } else if (edge === 1) {
      x = PLAYER_RADIUS + Math.random() * (SCREEN_WIDTH - PLAYER_RADIUS * 2);
      y = arenaBottom + 40;
      vx = (Math.random() - 0.5) * speed * 0.6;
      vy = -speed;
    } else if (edge === 2) {
      x = -40;
      y = arenaTop + Math.random() * (arenaBottom - arenaTop);
      vx = speed;
      vy = (Math.random() - 0.5) * speed * 0.6;
    } else {
      x = SCREEN_WIDTH + 40;
      y = arenaTop + Math.random() * (arenaBottom - arenaTop);
      vx = -speed;
      vy = (Math.random() - 0.5) * speed * 0.6;
    }

    const dist = Math.hypot(x - playerPos.x, y - playerPos.y);
    if (dist > SAFE_RADIUS) {
      break;
    }
  }

  return {
    id: generateId(),
    position: { x, y },
    velocity: { x: vx, y: vy },
    radius: BASE_OBSTACLE_RADIUS + Math.random() * 10,
    baseSpeed: speed,
    pursuing: true,
  };
}

function makeInitialObstacles(): ObstacleType[] {
  const centerPos = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };
  return [0, 1, 2, 3].map(() => spawnObstacleData(0, centerPos));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface GameSnapshot {
  securedScore: number;
  unbankedScore: number;
  multiplier: number;
  survivalTime: number;
  playerPosition: Position;
  obstacles: ObstacleType[];
  isWarning?: boolean;
  events: GameEvent[];
  dangerLevel: number;
}

export const useGameEngine = (
  onGameOver: (finalScore: number, survivalTime: number, bankedScore: number, multiplier: number) => void,
  initialBestScore: number
) => {
  // ── A single integer state that increments to drive re-renders when UI changes ──
  const [renderTick, setRenderTick] = useState(0);
  const frameCounter = useRef(0);

  // ── All rapidly-changing game data lives here ──────────────────────────────
  const isRunning      = useRef(false);
  const rafId          = useRef(0);
  const lastTimestamp  = useRef(0);
  const nextSpawnTime  = useRef(0);

  const playerPos      = useRef<Position>({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
  const obstacleList   = useRef<ObstacleType[]>([]);
  const survivalTime   = useRef(0);
  const securedScore   = useRef(0);
  const unbankedScore  = useRef(0);
  const multiplierIdx  = useRef(0);

  // Gameplay events: near misses, milestones, new best
  const activeEvents    = useRef<GameEvent[]>([]);
  const bestScore       = useRef(initialBestScore);
  const newBestNotified = useRef(false);
  const lastMilestoneSec = useRef(0);
  const EVENT_MILESTONES = [10, 20, 30, 45, 60];

  // snapshot for reading in render — always current because we update refs
  const snapshot = useRef<GameSnapshot>({
    securedScore: 0,
    unbankedScore: 0,
    multiplier: 1,
    survivalTime: 0,
    playerPosition: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
    obstacles: [],
    events: [],
    dangerLevel: 0,
  });

  // ── Stable callback ref for the game loop ──────────────────────────────────
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  // ── Game loop (no deps — reads everything from refs) ──────────────────────
  const loop = useCallback((timestamp: number) => {
    if (!isRunning.current) return;

    if (lastTimestamp.current === 0) lastTimestamp.current = timestamp;
    const dt = Math.min((timestamp - lastTimestamp.current) / 1000, 0.05); // cap dt at 50 ms
    lastTimestamp.current = timestamp;

    // ── Update time & score ────────────────────────────────────────────────
    survivalTime.current  += dt;
    const mult = MULTIPLIER_STEPS[multiplierIdx.current];
    unbankedScore.current += BASE_SCORE_PER_SECOND * mult * dt;

    // ── Update obstacles ──────────────────────────────────────────────────
    const arenaTop    = ARENA_TOP_OFFSET;
    const arenaBottom = SCREEN_HEIGHT - ARENA_BOTTOM_OFFSET;

    const riskSpeedMultiplier = 1 + (mult - 1) * 0.3; // 1x->1.0, 1.5x->1.15, 2x->1.3, 3x->1.6, 4x->1.9
    const riskSteeringMultiplier = 1 + (mult - 1) * 0.15; // 1x->1.0, 1.5x->1.075, 2x->1.15, 3x->1.3, 4x->1.45

    // Once an enemy closes within this distance it stops steering and coasts through
    const CLOSE_APPROACH_DIST = 90;

    let obs = obstacleList.current.map(o => {
      const dx = playerPos.current.x - o.position.x;
      const dy = playerPos.current.y - o.position.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Flip pursuing -> coasting the moment the enemy gets close enough
      const nowPursuing = o.pursuing && dist > CLOSE_APPROACH_DIST;

      let newVx = o.velocity.x;
      let newVy = o.velocity.y;

      if (nowPursuing) {
        // Steer gradually toward the player — enemy can be dodged because
        // steeringStrength is low enough that it can't make sharp turns.
        const normalizedDx = dx / dist;
        const normalizedDy = dy / dist;
        const effectiveSpeed = o.baseSpeed * riskSpeedMultiplier;
        const desiredVx = normalizedDx * effectiveSpeed;
        const desiredVy = normalizedDy * effectiveSpeed;

        const baseSteering = 1.8; // low value = wide sweeping arcs
        const steeringStrength = baseSteering * riskSteeringMultiplier;

        newVx = o.velocity.x + (desiredVx - o.velocity.x) * steeringStrength * dt;
        newVy = o.velocity.y + (desiredVy - o.velocity.y) * steeringStrength * dt;
      }
      // else: coasting — keep existing velocity exactly, enemy flies past

      return {
        ...o,
        pursuing: nowPursuing,
        velocity: { x: newVx, y: newVy },
        position: {
          x: o.position.x + newVx * dt,
          y: o.position.y + newVy * dt,
        },
      };
    });

    // Remove obstacles that are way off screen
    obs = obs.filter(o =>
      o.position.x > -80 && o.position.x < SCREEN_WIDTH + 80 &&
      o.position.y > arenaTop - 80 && o.position.y < arenaBottom + 80
    );

    // ── Obstacle separation ─────────────────────────────────────────────────
    // Keep a visible gap and deflect overlapping pursuers so they do not form a
    // single clump while converging on the player.
    for (let i = 0; i < obs.length; i++) {
      for (let j = i + 1; j < obs.length; j++) {
        const a = obs[i];
        const b = obs[j];
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius + 14;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const normalX = dist > 0 ? dx / dist : 1;
          const normalY = dist > 0 ? dy / dist : 0;
          const pushX = normalX * overlap;
          const pushY = normalY * overlap;
          const deflection = Math.min(90, overlap * 4);

          obs[i] = {
            ...a,
            position: { x: a.position.x - pushX, y: a.position.y - pushY },
            velocity: {
              x: a.velocity.x - normalX * deflection,
              y: a.velocity.y - normalY * deflection,
            },
          };
          obs[j] = {
            ...b,
            position: { x: b.position.x + pushX, y: b.position.y + pushY },
            velocity: {
              x: b.velocity.x + normalX * deflection,
              y: b.velocity.y + normalY * deflection,
            },
          };
        }
      }
    }

    // ── Spawn obstacles ────────────────────────────────────────────────────
    const t = survivalTime.current;
    if (t >= nextSpawnTime.current) {
      obs.push(spawnObstacleData(t, playerPos.current));

      let baseInterval = 3.0;
      if (t > 60) baseInterval = Math.max(0.4, 0.8 - (t - 60) * 0.01);
      else if (t > 30) baseInterval = 1.2 - ((t - 30) / 30) * 0.4;
      else if (t > 10) baseInterval = 2.0 - ((t - 10) / 20) * 0.8;
      else baseInterval = 3.0 - (t / 10) * 1.0;

      const riskSpawnMultiplier = 1 + (mult - 1) * 0.5;
      const effectiveInterval = Math.max(0.2, baseInterval / riskSpawnMultiplier);
      nextSpawnTime.current = t + effectiveInterval;
    }

    obstacleList.current = obs;

    // ── Milestone events ──────────────────────────────────────────────────
    const tFloor = Math.floor(t);
    const nextMilestone = EVENT_MILESTONES.find(
      m => m > lastMilestoneSec.current && tFloor >= m
    );
    if (nextMilestone !== undefined) {
      lastMilestoneSec.current = nextMilestone;
      activeEvents.current = [
        ...activeEvents.current,
        { id: `ms-${nextMilestone}`, type: 'milestone', text: `${nextMilestone}s SURVIVOR`, timestamp: Date.now() },
      ];
    }

    // ── New-best check ────────────────────────────────────────────────────
    const totalScore = securedScore.current + unbankedScore.current;
    if (!newBestNotified.current && totalScore > bestScore.current && bestScore.current > 0) {
      newBestNotified.current = true;
      bestScore.current = totalScore;
      activeEvents.current = [
        ...activeEvents.current,
        { id: `nb-${Date.now()}`, type: 'new_best', text: 'NEW BEST!', timestamp: Date.now() },
      ];
    }

    // Prune events older than 2.5 s
    const now = Date.now();
    activeEvents.current = activeEvents.current.filter(e => now - e.timestamp < 2500);

    // ── Collision + near-miss check ────────────────────────────────────────
    let warning = false;
    // NEAR_MISS_DIST: very close but not touching. Player radius + small gap.
    const NEAR_MISS_DIST = PLAYER_RADIUS + 18;

    for (const o of obs) {
      const dist = Math.hypot(playerPos.current.x - o.position.x, playerPos.current.y - o.position.y);
      if (dist < PLAYER_RADIUS + o.radius - 2) {
        // Actual collision — game over
        isRunning.current = false;
        cancelAnimationFrame(rafId.current);
        const totalScore = securedScore.current + unbankedScore.current;
        snapshot.current = {
          securedScore:   securedScore.current,
          unbankedScore:  unbankedScore.current,
          multiplier:     mult,
          survivalTime:   survivalTime.current,
          playerPosition: { ...playerPos.current },
          obstacles:      obs,
          isWarning:      false,
          events:         [],
          dangerLevel:    0,
        };
        setRenderTick(n => n + 1);
        onGameOverRef.current(totalScore, survivalTime.current, securedScore.current, mult);
        return;
      } else if (dist < PLAYER_RADIUS + o.radius + 40) {
        warning = true;
      }

      // Near-miss: enemy passed very close but didn't collide, and hasn't triggered yet
      if (!o.pursuing && !o.hasNearMissed && dist < o.radius + NEAR_MISS_DIST) {
        o.hasNearMissed = true;
        // Small score bonus
        unbankedScore.current += 5 * mult;
        activeEvents.current = [
          ...activeEvents.current,
          { id: `nm-${o.id}`, type: 'near_miss', text: 'NEAR MISS!', timestamp: Date.now() },
        ];
      }
    }

    // ── Danger level (0 = calm, 1 = critical) ─────────────────────────────
    // Time component: 0 at t=0, 1 at t=60
    const timeDanger = Math.min(1, t / 60);
    // Risk component: 0 at 1x, 1 at 4x
    const riskDanger = (mult - 1) / 3;
    // Proximity component: up to 0.3 extra if warning
    const proximityDanger = warning ? 0.3 : 0;
    const dangerLevel = Math.min(1, timeDanger * 0.5 + riskDanger * 0.35 + proximityDanger);

    // ── Update snapshot for render ────────────────────────────────────────
    snapshot.current = {
      securedScore:   securedScore.current,
      unbankedScore:  unbankedScore.current,
      multiplier:     mult,
      survivalTime:   t,
      playerPosition: { ...playerPos.current },
      obstacles:      obs,
      isWarning:      warning,
      events:         [...activeEvents.current],
      dangerLevel,
    };

    // Throttle re-renders to 15fps (every 4 frames) - still smooth but much less React overhead
    // Gameplay runs at 60fps, UI updates at 15fps is sufficient for score/time display
    frameCounter.current = (frameCounter.current + 1) % 4;
    if (frameCounter.current === 0 || activeEvents.current.length > 0) {
      setRenderTick(n => n + 1);
    }

    rafId.current = requestAnimationFrame(loop);
  }, []); // intentionally empty — reads everything from refs

  // ── Public API ─────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    isRunning.current      = true;
    lastTimestamp.current  = 0;
    survivalTime.current   = 0;
    securedScore.current   = 0;
    unbankedScore.current  = 0;
    multiplierIdx.current  = 0;
    playerPos.current      = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };
    obstacleList.current   = makeInitialObstacles();
    nextSpawnTime.current  = 3;
    activeEvents.current   = [];
    newBestNotified.current = false;
    lastMilestoneSec.current = 0;
    // bestScore.current is NOT reset — it persists across runs within a session

    snapshot.current = {
      securedScore:   0,
      unbankedScore:  0,
      multiplier:     1,
      survivalTime:   0,
      playerPosition: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
      obstacles:      obstacleList.current,
      events:         [],
      dangerLevel:    0,
    };

    rafId.current = requestAnimationFrame(loop);
  }, [loop]);

  const stopGame = useCallback(() => {
    isRunning.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  const bank = useCallback(() => {
    securedScore.current  += unbankedScore.current;
    unbankedScore.current  = 0;
    // Force a render so UI shows updated secured score
    setRenderTick(n => n + 1);
  }, []);

  const risk = useCallback(() => {
    if (multiplierIdx.current < MULTIPLIER_STEPS.length - 1) {
      multiplierIdx.current += 1;
    }
    setRenderTick(n => n + 1);
  }, []);

  const setPlayerPosition = useCallback((pos: Position) => {
    playerPos.current = pos;
    // no renderTick — position is read from snapshot on next frame
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunning.current = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    snapshot: snapshot.current,
    startGame,
    stopGame,
    bank,
    risk,
    setPlayerPosition,
  };
};
