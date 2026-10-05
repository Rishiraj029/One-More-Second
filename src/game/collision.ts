import { Position, ObstacleType } from './types';
import { PLAYER_RADIUS } from './constants';

export const checkCollision = (playerPos: Position, obstacles: ObstacleType[]): boolean => {
  for (const obs of obstacles) {
    const dx = playerPos.x - obs.position.x;
    const dy = playerPos.y - obs.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Add a tiny bit of leniency (e.g. - 2 pixels) for better feel
    if (distance < PLAYER_RADIUS + obs.radius - 2) {
      return true;
    }
  }
  return false;
};
