import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@OneMoreSecond:bestScore';

export const getBestScore = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(BEST_SCORE_KEY);
    if (value !== null) {
      return parseInt(value, 10);
    }
  } catch (e) {
    console.error('Failed to fetch best score.', e);
  }
  return 0;
};

export const saveBestScore = async (score: number): Promise<void> => {
  try {
    const currentBest = await getBestScore();
    if (score > currentBest) {
      await AsyncStorage.setItem(BEST_SCORE_KEY, score.toString());
    }
  } catch (e) {
    console.error('Failed to save best score.', e);
  }
};
