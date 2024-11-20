import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const icons = [
  'book', 'code-brackets', 'food', 'dumbbell',
  'music', 'pencil', 'run', 'basketball',
  'camera', 'palette', 'calculator', 'cards'
];

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const IconSelector = ({ selectedIcon, onSelectIcon }: IconSelectorProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconGrid}>
        {icons.map((iconName) => (
          <TouchableOpacity
            key={iconName}
            style={[
              styles.iconButton,
              selectedIcon === iconName && styles.selectedIcon
            ]}
            onPress={() => onSelectIcon(iconName)}
          >
            <MaterialCommunityIcons
              name={iconName as any}
              size={24}
              color={selectedIcon === iconName ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
});

export default IconSelector;