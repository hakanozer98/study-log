import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { colors } from '../../theme/colors'
import { CustomInput } from '../../components/CustomInput'
import { CustomButton } from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from 'expo-linking'
import { Snackbar } from '../../components/Snackbar'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', variant: 'error' as SnackbarTypes })
  const redirectTo = makeRedirectUri()

  const showSnackbar = (message: string, variant: SnackbarTypes = 'error' as SnackbarTypes) => {
    setSnackbar({ visible: true, message, variant })
  }

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
    router.navigate('(root)/reset-password')
    return data.session;
  };

  const url = Linking.useURL()
  if (url) {
    createSessionFromUrl(url)
  }

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) showSnackbar(error.message)
    setLoading(false)
  }

  async function forgotPassword() {
    if (!email) {
      showSnackbar('Please enter your email address')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: redirectTo }
    )
    if (error) {
      showSnackbar(error.message)
    } else {
      showSnackbar('Password reset email sent', 'success')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
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
            placeholder="Enter your password"
            secureTextEntry
          />
          <Pressable onPress={forgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </Pressable>
          <CustomButton
            title="Sign In"
            onPress={signInWithEmail}
            disabled={loading}
          />
        </View>

        <View style={styles.navigation}>
          <Text style={styles.navigationText}>Don't have an account?</Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={styles.navigationLink}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        variant={snackbar.variant}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
      />
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
  forgotPassword: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
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

export default SignIn