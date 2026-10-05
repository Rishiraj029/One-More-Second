import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH  = width;
export const SCREEN_HEIGHT = height;

export const PLAYER_RADIUS        = 22;
export const BASE_SCORE_PER_SECOND = 10;
export const BASE_OBSTACLE_RADIUS  = 16;

/** Pixels from the top of the screen where the arena starts (below the HUD). */
export const ARENA_TOP_OFFSET = 140;

/** Pixels from the bottom of the screen reserved for the BANK/RISK buttons. */
export const ARENA_BOTTOM_OFFSET = 120;
