export interface Position {
  x: number;
  y: number;
}

export interface ObstacleType {
  id: string;
  position: Position;
  velocity: Position;
  radius: number;
  baseSpeed: number;
  /** true = actively steering toward player; false = coasting on momentum */
  pursuing: boolean;
  hasNearMissed?: boolean;
}

export interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  securedScore: number;
  unbankedScore: number;
  multiplier: number;
  survivalTime: number; // in seconds
}

export interface GameEvent {
  id: string;
  type: 'near_miss' | 'milestone' | 'new_best';
  text: string;
  timestamp: number;
}
