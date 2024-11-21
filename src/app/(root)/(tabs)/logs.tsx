import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/src/lib/supabase'
import { StudyLog, Interval, Category } from '@/src/types/database'
import { colors } from '@/src/theme/colors'
import { format, differenceInSeconds, differenceInMilliseconds } from 'date-fns'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
}

const calculateTotalDuration = (intervals: Interval[]) => {
  return intervals.reduce((acc, interval) => {
    return acc + Math.round(differenceInMilliseconds(new Date(interval.end_time), new Date(interval.start_time)) / 1000)
  }, 0)
}

const Logs = () => {
  const [logs, setLogs] = useState<StudyLog[]>([])

  useFocusEffect(() => {
    fetchData()
  })

  const fetchData = async () => {
    const { data: study_logs, error: logsError } = await supabase
      .from('study_log')
      .select('*, category(*), interval(*)')
      .order('created_at', { ascending: false })

    if (study_logs) setLogs(study_logs)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Study Logs</Text>
      <ScrollView style={styles.scrollView}>
        {logs.map((log) => (
          <Pressable
            key={log.id}
            style={styles.card}
            onPress={() => router.navigate({pathname: '/log-details', params: {logId: log.id}})}
          >
            <View style={styles.cardHeader}>
              <View style={styles.categoryWrapper}>
                {log.category ? (
                  <View style={[styles.categoryBadge, { backgroundColor: log.category.color }]}>
                    <MaterialCommunityIcons
                      name={log.category.icon_name as any}
                      size={16}
                      color={colors.background}
                    />
                    <Text style={styles.categoryText}>{log.category.name}</Text>
                  </View>
                ) : (
                  <View style={[styles.categoryBadge, { backgroundColor: colors.outline }]}>
                    <Text style={styles.categoryText}>Uncategorized</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.dateText}>
                  {format(new Date(log.created_at), 'EEEE')}
                </Text>
                <Text style={styles.dateText}>
                  {format(new Date(log.created_at), 'dd/MM/yyyy')}
                </Text>
              </View>
            </View>
            <Text style={styles.logTitle}>{log.title}</Text>
            <View style={styles.intervalsContainer}>
              {log.interval && (
                <View style={styles.intervals}>
                  {log.interval.map((interval) => (
                    <View
                      key={interval.id}
                      style={[
                        styles.intervalCard,
                        {
                          backgroundColor: interval.is_study
                            ? colors.secondaryContainer
                            : colors.tertiaryContainer,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={interval.is_study ? "book-open-variant" : "coffee"}
                        size={20}
                        color={interval.is_study ? colors.onSecondaryContainer : colors.onTertiaryContainer}
                      />
                      <View style={styles.intervalInfo}>
                        <Text style={[
                          styles.intervalTime,
                          {
                            color: interval.is_study
                              ? colors.onSecondaryContainer
                              : colors.onTertiaryContainer
                          }
                        ]}>
                          {format(new Date(interval.start_time), 'HH:mm:ss')} -{' '}
                          {format(new Date(interval.end_time), 'HH:mm:ss')}
                        </Text>
                        <Text style={[
                          styles.intervalDuration,
                          {
                            color: interval.is_study
                              ? colors.onSecondaryContainer
                              : colors.onTertiaryContainer
                          }
                        ]}>
                          {formatDuration(
                            Math.round(differenceInMilliseconds(
                              new Date(interval.end_time),
                              new Date(interval.start_time)
                            ) / 1000)
                          )}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {log.interval && (
                <Text style={styles.totalDuration}>
                  Total: {formatDuration(calculateTotalDuration(log.interval))}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onBackground,
    padding: 16,
  },
  scrollView: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.elevation.level1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.background,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  intervalsContainer: {
    gap: 8,
  },
  intervals: {
    gap: 8,
    marginBottom: 8,
  },
  intervalCard: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalDuration: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    textAlign: 'right',
  },
  intervalInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intervalDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
})

export default Logs