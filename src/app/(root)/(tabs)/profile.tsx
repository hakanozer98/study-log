import { View, Text, Alert, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton } from '@/src/components/CustomButton'
import { supabase } from '@/src/lib/supabase'
import { colors } from '@/src/theme/colors'
import { useAuth } from '@/src/providers/AuthProvider'

const Profile = () => {

    const { user } = useAuth()

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email?.[0].toUpperCase() ?? '?'}</Text>
          </View>
        </View>
        <CustomButton variant='secondary' title="Sign Out" onPress={() => { supabase.auth.signOut() }} />
      </SafeAreaView>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      padding: 20,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarText: {
      color: colors.onPrimary,
      fontSize: 32,
      fontWeight: 'bold',
    },
    username: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.onBackground,
    },
  })

  export default Profile