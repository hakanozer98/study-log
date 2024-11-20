import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors as themeColors } from '@/src/theme/colors';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#E74C3C', '#2ECC71', '#F1C40F', '#1ABC9C'
];

interface ColorPickerProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onSelectColor }: ColorPickerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => onSelectColor(color)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: themeColors.primary,
  },
});

export default ColorPicker;