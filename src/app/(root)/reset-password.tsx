import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, Text, BackHandler } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { colors } from '../../theme/colors'
import { CustomInput } from '../../components/CustomInput'
import { CustomButton } from '../../components/CustomButton'
import { router } from 'expo-router'

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Add event listener for hardware back button (Android)
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                supabase.auth.signOut()
                return true // Prevents back navigation
            }
        )

        return () => {
            backHandler.remove()
        }
    }, [])

    async function resetPassword() {
        if (newPassword !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            Alert.alert(error.message);
        } else {
            const { error } = await supabase.auth.signOut();
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your new password</Text>
                </View>

                <View style={styles.form}>
                    <CustomInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        secureTextEntry
                    />
                    <CustomInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        secureTextEntry
                    />
                    <CustomButton
                        title="Reset Password"
                        onPress={resetPassword}
                        disabled={loading}
                    />
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
})

export default ResetPassword
