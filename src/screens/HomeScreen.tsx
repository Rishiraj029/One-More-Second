import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameButton } from '../components/GameButton';
import { getBestScore } from '../storage/scoreStorage';

interface HomeScreenProps {
  onPlay: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay }) => {
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    getBestScore().then(setBestScore);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ONE MORE SECOND</Text>
      <Text style={styles.subtitle}>How long will you risk it?</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.bestScoreLabel}>BEST SCORE</Text>
        <Text style={styles.bestScore}>{Math.floor(bestScore)}</Text>
      </View>
      <GameButton title="PLAY" onPress={onPlay} variant="primary" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 50,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  bestScoreLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  bestScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34c759',
  },
});
