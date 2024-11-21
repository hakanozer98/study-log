import { View, Text, Modal, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { colors } from '@/src/theme/colors'

interface ConfirmationDialogProps {
    visible: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmationDialog = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel
}: ConfirmationDialogProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Delete</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 24,
        width: '80%',
        maxWidth: 400,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.onSurface,
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: colors.onSurfaceVariant,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: colors.surfaceVariant,
    },
    confirmButton: {
        backgroundColor: colors.error,
    },
    cancelButtonText: {
        color: colors.onSurfaceVariant,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: colors.onError,
        fontWeight: '600',
    },
})

export default ConfirmationDialog