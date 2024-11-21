import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { StudyLog } from '@/src/types/database'
import { supabase } from '@/src/lib/supabase'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/src/theme/colors'
import { FontAwesome } from '@expo/vector-icons'
import { router } from 'expo-router'
import ConfirmationDialog from '@/src/components/ConfirmationDialog'

const LogDetails = () => {
    const [log, setLog] = useState<StudyLog>()
    const params = useLocalSearchParams()
    const logId = params.logId as string
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!logId) return
            const { data: study_log, error: logsError } = await supabase
                .from('study_log')
                .select('*, category(*), interval(*)')
                .eq('id', logId)
                .single()

            if (study_log) setLog(study_log)
        }
        fetchData()
    }, [logId])

    const calculateTotalTime = (intervals: StudyLog['interval']) => {
        if (!intervals) return { studyTime: 0, restTime: 0, totalTime: 0 }
        return intervals.reduce((acc, interval) => {
            const start = new Date(interval.start_time)
            const end = new Date(interval.end_time)
            const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
            if (interval.is_study) {
                acc.studyTime += duration
            } else {
                acc.restTime += duration
            }
            acc.totalTime += duration
            return acc
        }, { studyTime: 0, restTime: 0, totalTime: 0 })
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours}h ${minutes}m ${secs}s`
    }

    const formatTimeString = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleDelete = async () => {
        if (!log) return
        const { error } = await supabase
            .from('study_log')
            .delete()
            .eq('id', log.id)

        if (!error) {
            router.back()
        }
    }

    if (!log) return null

    const { studyTime, restTime, totalTime } = calculateTotalTime(log.interval)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.date}>{formatDate(log.created_at)}</Text>
                    <Text style={styles.title}>{log.title}</Text>
                    {log.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: log.category.color }]}>
                            <FontAwesome name={log.category.icon_name as any} size={16} color={colors.background} />
                            <Text style={styles.categoryText}>{log.category.name}</Text>
                        </View>
                    )}
                    <Text style={styles.totalTime}>Total Duration: {formatTime(totalTime)}</Text>
                    <Pressable 
                        style={styles.deleteButton}
                        onPress={() => setShowDeleteDialog(true)}
                    >
                        <Text style={styles.deleteButtonText}>Delete Log</Text>
                    </Pressable>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Study Time</Text>
                        <Text style={[styles.statValue, { color: colors.study.text }]}>{formatTime(studyTime)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Rest Time</Text>
                        <Text style={[styles.statValue, { color: colors.rest.text }]}>{formatTime(restTime)}</Text>
                    </View>
                </View>

                <View style={styles.timelineContainer}>
                    <Text style={styles.sectionTitle}>Session Intervals</Text>
                    {log.interval?.map((interval, index) => (
                        <View
                            key={interval.id}
                            style={[
                                styles.timelineItem,
                                {
                                    backgroundColor: interval.is_study
                                        ? colors.study.background
                                        : colors.rest.background
                                }
                            ]}
                        >
                            <Text style={[
                                styles.timelineText,
                                { color: interval.is_study ? colors.study.text : colors.rest.text }
                            ]}>
                                {formatTimeString(interval.start_time)} - {formatTimeString(interval.end_time)}
                                {' • '}
                                {interval.is_study ? 'Study' : 'Rest'}
                            </Text>
                        </View>
                    ))}
                </View>

                <ConfirmationDialog
                    visible={showDeleteDialog}
                    title="Delete Study Log"
                    message="Are you sure you want to delete this study log? This action cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        backgroundColor: colors.surfaceVariant,
        borderRadius: 12,
        margin: 16,
    },
    date: {
        fontSize: 14,
        color: colors.onSurfaceVariant,
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.onSurface,
        marginBottom: 8,
    },
    totalTime: {
        fontSize: 16,
        color: colors.onSurfaceVariant,
        marginTop: 8,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    categoryText: {
        color: colors.background,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        margin: 16,
        gap: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surfaceVariant,
        padding: 16,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: 14,
        color: colors.onSurfaceVariant,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    timelineContainer: {
        margin: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.onSurface,
        marginBottom: 4,
    },
    timelineItem: {
        padding: 16,
        borderRadius: 8,
    },
    timelineText: {
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: colors.error,
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    deleteButtonText: {
        color: colors.onError,
        fontWeight: '600',
    },
})

export default LogDetails