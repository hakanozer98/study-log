import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { colors } from '../../theme/colors'
import { CustomInput } from '../../components/CustomInput'
import { CustomButton } from '../../components/CustomButton'
import { Link } from 'expo-router'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from 'expo-linking'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const redirectTo = makeRedirectUri()

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  };

  const url = Linking.useURL()
  if (url) {
    createSessionFromUrl(url)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) Alert.alert(error.message)
    else {
      Alert.alert('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@address.com"
          />
          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
            secureTextEntry
          />
          <CustomButton
            title="Sign Up"
            onPress={signUpWithEmail}
            disabled={loading}
          />
        </View>

        <View style={styles.navigation}>
          <Text style={styles.navigationText}>Already have an account?</Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={styles.navigationLink}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  navigationText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  navigationLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
})

export default SignUp