import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/src/providers/AuthProvider'

const RootLayout = () => {
  const { isAuthenticated } = useAuth()

  if(!isAuthenticated) {
    return <Redirect href='/(auth)/sign-in' />
  }

  return (
    <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout