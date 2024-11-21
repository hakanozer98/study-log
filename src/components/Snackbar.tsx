import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

type SnackbarProps = {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
};

const { height } = Dimensions.get('window');

export const Snackbar = ({
  visible,
  onDismiss,
  message,
  variant = 'info',
  duration = 5000,
}: SnackbarProps) => {
  const translateY = useRef(new Animated.Value(height)).current;

  const backgroundColor = variant === 'success' 
    ? colors.secondaryContainer
    : variant === 'error'
    ? colors.errorContainer
    : colors.primaryContainer;

  const textColor = variant === 'success'
    ? colors.onSecondaryContainer
    : variant === 'error'
    ? colors.onErrorContainer
    : colors.onPrimaryContainer;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.timing(translateY, {
        toValue: -75,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideSnackbar();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideSnackbar = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY }] }
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});