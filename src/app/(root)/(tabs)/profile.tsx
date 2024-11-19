import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton } from '@/src/components/CustomButton'
import { supabase } from '@/src/lib/supabase'

const Profile = () => {
  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <CustomButton variant='secondary' title="Sign Out" onPress={() => {supabase.auth.signOut()}} />
    </SafeAreaView>
  )
}

export default Profile