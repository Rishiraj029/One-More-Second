import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success';
  style?: object;
}

export const GameButton: React.FC<GameButtonProps> = ({ title, onPress, variant = 'primary', style }) => {
  let bgColor = '#2a3a4e';
  let borderColor = '#4a5a7e';
  let textColor = '#ffffff';

  if (variant === 'danger') {
    bgColor = '#280d0d';
    borderColor = '#ff3b30';
    textColor = '#ff3b30';
  }
  if (variant === 'success') {
    bgColor = '#0d2818';
    borderColor = '#30d158';
    textColor = '#30d158';
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor, borderColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
