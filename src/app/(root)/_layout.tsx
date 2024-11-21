import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/src/providers/AuthProvider'

const RootLayout = () => {
  const { isAuthenticated } = useAuth()

  if(!isAuthenticated) {
    return <Redirect href='/(auth)/sign-in' />
  }

  return (
    <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='categories' />
        <Stack.Screen name='add-category' />
        <Stack.Screen name='log-details' />
        <Stack.Screen name='reset-password' />
    </Stack>
  )
}

export default RootLayout