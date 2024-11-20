import React from 'react'
import { View, TextInput, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { colors } from '../theme/colors'

interface CustomInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  style?: StyleProp<ViewStyle>
}

export const CustomInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry,
  style
}: CustomInputProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.onBackground,
  },
})