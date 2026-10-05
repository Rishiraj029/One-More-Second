import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ObstacleType } from '../game/types';
import { ARENA_TOP_OFFSET } from '../game/constants';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export const Obstacle: React.FC<ObstacleProps> = React.memo(({ obstacle }) => {
  const { position, radius } = obstacle;
  const auraSize = radius * 2 + 20;
  const glowSize = radius * 2 + 8;

  return (
    <View
      style={[
        styles.aura,
        {
          left: position.x - radius - 10,
          top: position.y - ARENA_TOP_OFFSET - radius - 10,
          width: auraSize,
          height: auraSize,
          borderRadius: auraSize / 2,
        },
      ]}
    >
      <View
        style={[
          styles.glow,
          {
            left: 10,
            top: 10,
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
          },
        ]}
      />
      <View
        style={[
          styles.obstacle,
          {
            left: 10,
            top: 10,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 45, 32, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 45, 32, 0.3)',
  },
  obstacle: {
    position: 'absolute',
    backgroundColor: '#ff2d20',
    shadowColor: '#ff2d20',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 150, 140, 0.7)',
  },
});

