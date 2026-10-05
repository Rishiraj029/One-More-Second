import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Position } from '../game/types';
import { PLAYER_RADIUS, ARENA_TOP_OFFSET } from '../game/constants';

interface PlayerProps {
  position: Position;
  isTouching?: boolean;
}

export const Player: React.FC<PlayerProps> = ({ position, isTouching = false }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const auraPulse = useRef(new Animated.Value(1)).current;
  const touchScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(auraPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(touchScale, {
      toValue: isTouching ? 1.15 : 1,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isTouching]);

  const size = PLAYER_RADIUS * 2;
  const auraSize = size + 16;
  const touchGlowSize = size + 32;

  return (
    <Animated.View
      style={[
        styles.aura,
        {
          left: position.x - PLAYER_RADIUS - 8,
          top: position.y - ARENA_TOP_OFFSET - PLAYER_RADIUS - 8,
          width: auraSize,
          height: auraSize,
          borderRadius: auraSize / 2,
          transform: [{ scale: auraPulse }],
        },
      ]}
    >
      {isTouching && (
        <Animated.View
          style={[
            styles.touchGlow,
            {
              left: -8,
              top: -8,
              width: touchGlowSize,
              height: touchGlowSize,
              borderRadius: touchGlowSize / 2,
              opacity: touchScale.interpolate({
                inputRange: [1, 1.15],
                outputRange: [0, 0.6],
              }),
              transform: [{ scale: touchScale }],
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.player,
          {
            width: size,
            height: size,
            borderRadius: PLAYER_RADIUS,
            transform: [{ scale: pulse }, { scale: touchScale }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  aura: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 207, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 207, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(0, 207, 255, 0.4)',
  },
  player: {
    backgroundColor: '#00cfff',
    shadowColor: '#00cfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(180, 240, 255, 0.8)',
  },
});

