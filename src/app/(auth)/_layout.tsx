import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/src/providers/AuthProvider'

const AuthLayout = () => {
    const { isAuthenticated } = useAuth()

    if(isAuthenticated) {
        return <Redirect href='/(root)/(tabs)/timer' />
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
        </Stack>
    )
}

export default AuthLayout