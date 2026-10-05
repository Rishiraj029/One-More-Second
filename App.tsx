import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { getBestScore } from './src/storage/scoreStorage';

type Screen = 'home' | 'game' | 'gameover';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [finalScore, setFinalScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [bankedScore, setBankedScore] = useState(0);
  const [finalMultiplier, setFinalMultiplier] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    getBestScore().then(setBestScore);
  }, []);

  const handlePlay = useCallback(() => {
    getBestScore().then(score => {
      setBestScore(score);
      setGameKey(k => k + 1);
      setCurrentScreen('game');
    });
  }, []);

  const handleGameOver = useCallback((score: number, time: number, banked: number, multiplier: number) => {
    setFinalScore(score);
    setSurvivalTime(time);
    setBankedScore(banked);
    setFinalMultiplier(multiplier);
    // Refresh best for next game
    getBestScore().then(setBestScore);
    setCurrentScreen('gameover');
  }, []);

  const handleHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar hidden />
        {currentScreen === 'home' && (
          <HomeScreen onPlay={handlePlay} />
        )}
        {currentScreen === 'game' && (
          <GameScreen key={gameKey} onGameOver={handleGameOver} />
        )}
        {currentScreen === 'gameover' && (
          <GameOverScreen
            finalScore={finalScore}
            survivalTime={survivalTime}
            bankedScore={bankedScore}
            multiplier={finalMultiplier}
            onPlayAgain={handlePlay}
            onHome={handleHome}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
