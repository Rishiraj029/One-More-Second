import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useGameEngine } from '../game/gameEngine';
import { Player } from '../components/Player';
import { Obstacle } from '../components/Obstacle';
import {
  PLAYER_RADIUS,
} from '../game/constants';
import { GameEvent } from '../game/types';

interface GameScreenProps {
  onGameOver: (finalScore: number, survivalTime: number, bankedScore: number, multiplier: number) => void;
}

// ─── Lightweight drifting background particle ─────────────────────────────────
const NUM_PARTICLES = 8;
const ParticleLayer: React.FC<{ dangerLevel: number, width: number, height: number }> = React.memo(({ dangerLevel, width, height }) => {
  const particles = useMemo(() => {
    return Array.from({ length: NUM_PARTICLES }, (_, i) => {
      const anim = new Animated.ValueXY({
        x: Math.random() * width,
        y: Math.random() * height,
      });
      const opacity = new Animated.Value(0.06 + Math.random() * 0.08);
      const duration = 6000 + Math.random() * 6000;
      const targetX = Math.random() * width;
      const targetY = Math.random() * height;
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: { x: targetX, y: targetY }, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: { x: Math.random() * width, y: Math.random() * height }, duration, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.14, duration: duration / 2, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.03, duration: duration / 2, useNativeDriver: true }),
        ])
      ).start();
      return { anim, opacity, size: 2 + Math.random() * 3 };
    });
  }, [width, height]); // created once, drift forever

  const baseColor = dangerLevel > 0.5 ? '#ff6060' : '#4af';

  return (
    <>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: baseColor,
            opacity: p.opacity,
            transform: [{ translateX: p.anim.x }, { translateY: p.anim.y }],
          }}
        />
      ))}
    </>
  );
});

// ─── Event toast ──────────────────────────────────────────────────────────────
const TOAST_COLORS: Record<GameEvent['type'], string> = {
  near_miss: '#ffcc00',
  milestone: '#00cfff',
  new_best:  '#34c759',
};

const EventToast: React.FC<{ event: GameEvent }> = React.memo(({ event }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [anim]);

  return (
    <Animated.Text
      style={[
        styles.toast,
        { color: TOAST_COLORS[event.type] },
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      {event.text}
    </Animated.Text>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const { snapshot, startGame, stopGame, bank, risk, setPlayerPosition } =
    useGameEngine(onGameOver, 0);

  const { width, height } = useWindowDimensions();
  const isTouched = useRef(false);
  const [isTouching, setIsTouching] = useState(false);

  const HUD_HEIGHT = 100;
  const ACTION_BAR_HEIGHT = 100;

  useEffect(() => {
    startGame();
    return () => stopGame();
  }, []);

  const arenaMinY = HUD_HEIGHT + PLAYER_RADIUS;
  const arenaMaxY = height - ACTION_BAR_HEIGHT - PLAYER_RADIUS;
  const TOUCH_RADIUS = PLAYER_RADIUS * 1.8;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const dist = Math.hypot(pageX - playerPosition.x, pageY - playerPosition.y);
        if (dist < TOUCH_RADIUS) {
          isTouched.current = true;
          setIsTouching(true);
        }
        setPlayerPosition({
          x: Math.max(PLAYER_RADIUS, Math.min(width - PLAYER_RADIUS, pageX)),
          y: Math.max(arenaMinY, Math.min(arenaMaxY, pageY)),
        });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setPlayerPosition({
          x: Math.max(PLAYER_RADIUS, Math.min(width - PLAYER_RADIUS, pageX)),
          y: Math.max(arenaMinY, Math.min(arenaMaxY, pageY)),
        });
      },
      onPanResponderRelease: () => {
        isTouched.current = false;
        setIsTouching(false);
      },
      onPanResponderTerminate: () => {
        isTouched.current = false;
        setIsTouching(false);
      },
    })
  ).current;

  const bankAnim = useRef(new Animated.Value(0)).current;
  const riskAnim = useRef(new Animated.Value(0)).current;

  const handleBank = useCallback(() => {
    bank();
    bankAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bankAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.timing(bankAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [bank, bankAnim]);

  const handleRisk = useCallback(() => {
    risk();
    riskAnim.setValue(0);
    Animated.sequence([
      Animated.timing(riskAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.timing(riskAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [risk, riskAnim]);

  const { securedScore, unbankedScore, multiplier, survivalTime, playerPosition, obstacles, events, dangerLevel, isWarning } = snapshot;

  const dangerOpacity = Math.min(0.22, dangerLevel * 0.22);

  return (
    <View style={styles.container}>
      {/* HUD */}
      <View style={[styles.hud, { height: HUD_HEIGHT }]}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>BANKED</Text>
          <Animated.Text
            style={[
              styles.hudValue, styles.green,
              { transform: [{ scale: bankAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }] },
            ]}
          >
            {Math.floor(securedScore)}
          </Animated.Text>
          <Animated.Text
            style={[styles.toast, styles.green, {
              opacity: bankAnim,
              transform: [{ translateY: bankAnim.interpolate({ inputRange: [0, 1], outputRange: [8, -4] }) }],
            }]}
          >
            BANKED!
          </Animated.Text>
        </View>

        <View style={styles.hudCenter}>
          <Text style={styles.hudLabelCenter}>SCORE</Text>
          <Text style={styles.bigScore}>{Math.floor(securedScore + unbankedScore)}</Text>
        </View>

        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>MULT</Text>
          <Animated.Text
            style={[
              styles.hudValue, styles.cyan,
              { transform: [{ scale: riskAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }] },
            ]}
          >
            {multiplier}×
          </Animated.Text>
          <Animated.Text
            style={[styles.toast, styles.cyan, {
              opacity: riskAnim,
              transform: [{ translateY: riskAnim.interpolate({ inputRange: [0, 1], outputRange: [8, -4] }) }],
            }]}
          >
            {multiplier}× RISK
          </Animated.Text>
        </View>

        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>TIME</Text>
          <Text style={styles.hudValue}>{Math.floor(survivalTime)}s</Text>
        </View>
      </View>

      {/* Arena */}
      <View style={[styles.arena, { height: height - HUD_HEIGHT - ACTION_BAR_HEIGHT }]} {...panResponder.panHandlers}>
        <ParticleLayer dangerLevel={dangerLevel} width={width} height={height - HUD_HEIGHT - ACTION_BAR_HEIGHT} />

        {/* Danger atmosphere overlay */}
        <View
          pointerEvents="none"
          style={[styles.dangerOverlay, { opacity: dangerOpacity }]}
        />
        {isWarning && (
          <View pointerEvents="none" style={[styles.dangerOverlay, { opacity: 0.12 }]} />
        )}

        <Player position={playerPosition} isTouching={isTouching} />
        {obstacles.map(obs => (
          <Obstacle key={obs.id} obstacle={obs} />
        ))}

        {/* Event toasts rendered over arena */}
        <View style={styles.toastContainer} pointerEvents="none">
          {events.map(e => (
            <EventToast key={e.id} event={e} />
          ))}
        </View>
      </View>

      {/* Controls - Bottom Action Bar */}
      <View style={[styles.controls, { height: ACTION_BAR_HEIGHT }]}>
        {/* BANK */}
        <TouchableOpacity onPress={handleBank} activeOpacity={0.7} style={styles.bankBtn}>
          <Text style={styles.bankLabel}>BANK</Text>
          <Text style={styles.bankSub}>SECURE SCORE</Text>
        </TouchableOpacity>

        {/* RISK */}
        <TouchableOpacity onPress={handleRisk} activeOpacity={0.7} style={styles.riskBtn}>
          <Text style={styles.riskLabel}>RISK</Text>
          <Text style={styles.riskSub}>
            {multiplier < 4 ? `NEXT: ${[1, 1.5, 2, 3, 4][[1, 1.5, 2, 3, 4].indexOf(multiplier) + 1]}×` : 'MAX'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080d',
  },
  // ─ HUD ─
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 42,
    paddingBottom: 6,
    backgroundColor: '#0a0c12',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1e28',
  },
  hudItem: {
    alignItems: 'center',
    width: 72,
  },
  hudCenter: {
    alignItems: 'center',
    flex: 1,
  },
  hudLabel: {
    color: '#3a4a5e',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  hudLabelCenter: {
    color: '#4a5a7e',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  hudValue: {
    color: '#e0e8f8',
    fontSize: 19,
    fontWeight: 'bold',
  },
  bigScore: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 207, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  green: { color: '#30d158' },
  cyan:  { color: '#00cfff' },
  // ─ Arena ─
  arena: {
    width: '100%',
    backgroundColor: '#06080d',
    overflow: 'hidden',
  },
  dangerOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: '#ff3030',
  },
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginVertical: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // ─ Controls ─
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0a0c12',
    borderTopWidth: 1,
    borderTopColor: '#1a1e28',
  },
  bankBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#0d2818',
    borderWidth: 2,
    borderColor: '#30d158',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#30d158',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  bankLabel: {
    color: '#30d158',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  bankSub: {
    color: '#30d15880',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  riskBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#280d0d',
    borderWidth: 2,
    borderColor: '#ff3b30',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  riskLabel: {
    color: '#ff3b30',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  riskSub: {
    color: '#ff3b3080',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
});
