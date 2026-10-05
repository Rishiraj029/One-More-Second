import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameButton } from '../components/GameButton';
import { getBestScore, saveBestScore } from '../storage/scoreStorage';

interface GameOverScreenProps {
  finalScore: number;
  survivalTime: number;
  bankedScore: number;
  multiplier: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

const formatScore = (score: number) => Math.floor(score).toLocaleString();

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  finalScore,
  survivalTime,
  bankedScore,
  multiplier,
  onPlayAgain,
  onHome,
}) => {
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const handleScore = async () => {
      const currentBest = await getBestScore();
      const final = Math.floor(finalScore);

      if (final > currentBest) {
        setIsNewBest(true);
        await saveBestScore(final);
        setBestScore(final);
      } else {
        setIsNewBest(false);
        setBestScore(currentBest);
      }
    };
    handleScore();
  }, [finalScore]);

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blueGlow} />
        <View style={styles.redGlow} />
        <View style={styles.blueArenaRing} />
        <View style={styles.redArenaRing} />
        <View style={styles.vignetteTop} />
        <View style={styles.vignetteBottom} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>RUN COMPLETE</Text>
              <Text style={styles.title}>GAME OVER</Text>
              {isNewBest && (
                <View style={styles.newBestBadge}>
                  <View style={styles.badgeSpark} />
                  <Text style={styles.newBestText}>NEW BEST</Text>
                  <View style={styles.badgeSpark} />
                </View>
              )}
            </View>

            <View style={styles.scoreHero}>
              <Text style={styles.scoreLabel}>FINAL SCORE</Text>
              <Text style={styles.scoreValue}>{formatScore(finalScore)}</Text>
              <View style={styles.scoreUnderline} />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.runStats}>
                <Stat label="SURVIVED" value={`${Math.floor(survivalTime)}s`} />
                <View style={styles.statDivider} />
                <Stat label="BANKED" value={formatScore(bankedScore)} />
                <View style={styles.statDivider} />
                <Stat label="MULTIPLIER" value={`${multiplier}x`} />
              </View>

              <View style={styles.bestRow}>
                <View>
                  <Text style={styles.bestLabel}>BEST SCORE</Text>
                  <Text style={styles.bestCaption}>
                    {isNewBest ? 'NEW PERSONAL RECORD' : 'PERSONAL RECORD'}
                  </Text>
                </View>
                <Text style={[styles.bestValue, isNewBest && styles.newBestValue]}>
                  {formatScore(bestScore)}
                </Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <GameButton
                title="PLAY AGAIN"
                onPress={onPlayAgain}
                variant="primary"
                style={styles.playButton}
              />
              <GameButton
                title="HOME"
                onPress={onHome}
                variant="danger"
                style={styles.homeButton}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080d',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 22,
  },
  blueGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: '8%',
    left: '-42%',
    backgroundColor: 'rgba(0, 150, 255, 0.07)',
  },
  redGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: '5%',
    right: '-45%',
    backgroundColor: 'rgba(255, 48, 48, 0.06)',
  },
  blueArenaRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.07)',
    top: '12%',
    right: '-34%',
  },
  redArenaRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.06)',
    bottom: '14%',
    left: '-26%',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '18%',
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  heading: {
    alignItems: 'center',
    gap: 7,
  },
  eyebrow: {
    color: '#687993',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: '#ff4b43',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 59, 48, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 207, 255, 0.38)',
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    shadowColor: '#00cfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeSpark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#73e8ff',
  },
  newBestText: {
    color: '#8decff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scoreHero: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  scoreLabel: {
    color: '#71819c',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.6,
  },
  scoreValue: {
    color: '#f4f8ff',
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 72,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 207, 255, 0.44)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  scoreUnderline: {
    width: 42,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#00cfff',
    opacity: 0.75,
    shadowColor: '#00cfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 7,
  },
  statsContainer: {
    width: '100%',
    paddingHorizontal: 17,
    paddingTop: 19,
    paddingBottom: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(100, 133, 179, 0.22)',
    backgroundColor: 'rgba(13, 18, 28, 0.92)',
    shadowColor: '#008dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  runStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 17,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  statLabel: {
    color: '#74829b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statValue: {
    color: '#e5efff',
    fontSize: 19,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(111, 135, 173, 0.25)',
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(111, 135, 173, 0.22)',
    paddingTop: 14,
    gap: 12,
  },
  bestLabel: {
    color: '#91a4c2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  bestCaption: {
    color: '#506078',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  bestValue: {
    color: '#d9e6fa',
    fontSize: 23,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  newBestValue: {
    color: '#8decff',
    textShadowColor: 'rgba(0, 207, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
  buttons: {
    width: '100%',
    gap: 11,
  },
  playButton: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 15,
    borderColor: '#00cfff',
    backgroundColor: '#073040',
    shadowColor: '#00cfff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 11,
    elevation: 5,
  },
  homeButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 67, 0.35)',
    backgroundColor: 'rgba(32, 16, 20, 0.62)',
    shadowOpacity: 0,
    elevation: 0,
  },
});
