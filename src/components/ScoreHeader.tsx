import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreHeaderProps {
  securedScore: number;
  unbankedScore: number;
  multiplier: number;
  survivalTime: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({ securedScore, unbankedScore, multiplier, survivalTime }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Secured:</Text>
        <Text style={styles.securedScore}>{Math.floor(securedScore)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Risking:</Text>
        <Text style={styles.unbankedScore}>+{Math.floor(unbankedScore)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Multiplier:</Text>
        <Text style={styles.multiplier}>{multiplier}x</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.time}>{Math.floor(survivalTime)}s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  row: {
    alignItems: 'center',
    width: '45%',
    marginVertical: 5,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  securedScore: {
    color: '#34c759',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unbankedScore: {
    color: '#ff9500',
    fontSize: 20,
    fontWeight: 'bold',
  },
  multiplier: {
    color: '#00d2ff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  time: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
