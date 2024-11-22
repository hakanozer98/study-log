import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/src/lib/supabase'
import { StudyLog } from '@/src/types/database'
import { colors } from '@/src/theme/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { differenceInMilliseconds, startOfToday, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, startOfDay, endOfDay, format } from 'date-fns'
import DateTimePicker from '@react-native-community/datetimepicker'

const TIME_PERIODS = [
  { id: 'today', label: 'Today', icon: 'calendar-today' },
  { id: 'this-week', label: 'This Week', icon: 'calendar-week' },
  { id: 'this-month', label: 'This Month', icon: 'calendar-month' },
  { id: 'this-year', label: 'This Year', icon: 'calendar' },
  { id: 'last-7-days', label: 'Last 7 Days', icon: 'calendar-clock' },
  { id: 'last-month', label: 'Last Month', icon: 'calendar-month-outline' },
  { id: 'specific-date', label: 'Specific Date', icon: 'calendar-search' },
  { id: 'date-range', label: 'Date Range', icon: 'calendar-range' },
  { id: 'all', label: 'All Time', icon: 'infinity' },
] as const

type TimePeriod = typeof TIME_PERIODS[number]['id']

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

const Stats = () => {
  const [logs, setLogs] = useState<StudyLog[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today')
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRangePicker, setShowRangePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() })
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      fetchData()
      return () => {
        setShowDatePicker(false)
        setShowRangePicker(false)
      }
    }, [selectedPeriod, selectedDate, dateRange])
  )

  const fetchData = async () => {
    let query = supabase
      .from('study_log')
      .select('*, category(*), interval(*)')
      .order('created_at', { ascending: false })

    const now = new Date()
    switch (selectedPeriod) {
      case 'today':
        query = query.gte('created_at', startOfToday().toISOString())
        break
      case 'this-week':
        query = query.gte('created_at', startOfWeek(now).toISOString())
        break
      case 'this-month':
        query = query.gte('created_at', startOfMonth(now).toISOString())
        break
      case 'this-year':
        query = query.gte('created_at', startOfYear(now).toISOString())
        break
      case 'last-7-days':
        query = query.gte('created_at', subDays(now, 7).toISOString())
        break
      case 'last-month':
        query = query.gte('created_at', subMonths(now, 1).toISOString())
        break
      case 'specific-date':
        query = query
          .gte('created_at', startOfDay(selectedDate).toISOString())
          .lt('created_at', endOfDay(selectedDate).toISOString())
        break
      case 'date-range':
        query = query
          .gte('created_at', startOfDay(dateRange.start).toISOString())
          .lt('created_at', endOfDay(dateRange.end).toISOString())
        break
    }

    const { data: study_logs } = await query
    if (study_logs) setLogs(study_logs)
  }

  const calculateStats = () => {
    let totalStudyTime = 0
    let totalRestTime = 0
    let totalSessions = 0
    let categoryTimes: Record<string, number> = {}

    logs.forEach(log => {
      if (log.interval) {
        log.interval.forEach(interval => {
          const duration = Math.round(
            differenceInMilliseconds(new Date(interval.end_time), new Date(interval.start_time)) / 1000
          )
          
          if (interval.is_study) {
            totalStudyTime += duration
            totalSessions++
            if (log.category) {
              categoryTimes[log.category.name] = (categoryTimes[log.category.name] || 0) + duration
            }
          } else {
            totalRestTime += duration
          }
        })
      }
    })

    return {
      totalStudyTime,
      totalRestTime,
      totalSessions,
      categoryTimes
    }
  }

  const handlePeriodSelect = (period: TimePeriod) => {
    setSelectedPeriod(period)
    if (period === 'specific-date') {
      setShowDatePicker(true)
    } else if (period === 'date-range') {
      setIsSelectingEndDate(false)
      setShowRangePicker(true)
    } else {
      setShowPeriodSelector(false)
      fetchData()
    }
  }

  const handleDateSelect = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
      setShowRangePicker(false)
    }

    if (date) {
      if (selectedPeriod === 'specific-date') {
        setSelectedDate(date)
        if (Platform.OS === 'android') {
          setShowPeriodSelector(false)
          fetchData()
        }
      } else if (selectedPeriod === 'date-range') {
        if (!isSelectingEndDate) {
          setDateRange(prev => ({ ...prev, start: date }))
          if (Platform.OS === 'android') {
            setTimeout(() => setShowRangePicker(true), 1000)
          }
          setIsSelectingEndDate(true)
        } else {
          setDateRange(prev => ({ ...prev, end: date }))
          if (Platform.OS === 'android') {
            setShowPeriodSelector(false)
            fetchData()
          }
        }
      }
    }

    if (Platform.OS === 'ios') {
      if (!isSelectingEndDate || selectedPeriod === 'specific-date') {
        setShowPeriodSelector(false)
        fetchData()
      }
    }
  }

  const getPeriodLabel = () => {
    const period = TIME_PERIODS.find(p => p.id === selectedPeriod)
    if (selectedPeriod === 'specific-date') {
      return format(selectedDate, 'dd MMM yyyy')
    }
    if (selectedPeriod === 'date-range') {
      return `${format(dateRange.start, 'dd MMM')} - ${format(dateRange.end, 'dd MMM')}`
    }
    return period?.label
  }

  const stats = calculateStats()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Pressable
          style={styles.periodSelector}
          onPress={() => setShowPeriodSelector(true)}
        >
          <MaterialCommunityIcons
            name={TIME_PERIODS.find(p => p.id === selectedPeriod)?.icon || 'calendar'}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.periodText}>
            {getPeriodLabel()}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.statsLabel}>Total Study Time</Text>
            <Text style={styles.statsValue}>{formatDuration(stats.totalStudyTime)}</Text>
          </View>

          <View style={styles.statsCard}>
            <MaterialCommunityIcons name="coffee" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.statsLabel}>Total Break Time</Text>
            <Text style={styles.statsValue}>{formatDuration(stats.totalRestTime)}</Text>
          </View>

          <View style={styles.statsCard}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={colors.onSurfaceVariant} />
            <Text style={styles.statsLabel}>Study Sessions</Text>
            <Text style={styles.statsValue}>{stats.totalSessions}</Text>
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Study Time by Category</Text>
          {Object.entries(stats.categoryTimes).map(([category, time]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryTime}>{formatDuration(time)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPeriodSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPeriodSelector(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPeriodSelector(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time Period</Text>
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period.id}
                style={[
                  styles.periodOption,
                  selectedPeriod === period.id && styles.selectedPeriod,
                ]}
                onPress={() => handlePeriodSelect(period.id)}
              >
                <MaterialCommunityIcons
                  name={period.icon}
                  size={24}
                  color={selectedPeriod === period.id ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === period.id && styles.selectedPeriodText,
                ]}>
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {Platform.OS === 'ios' ? (
        (showDatePicker || showRangePicker) && (
          <DateTimePicker
            value={showRangePicker ? (isSelectingEndDate ? dateRange.end : dateRange.start) : selectedDate}
            mode="date"
            onChange={handleDateSelect}
            maximumDate={new Date()}
            display="inline"
          />
        )
      ) : (
        (showDatePicker || showRangePicker) && (
          <DateTimePicker
            value={showRangePicker ? (isSelectingEndDate ? dateRange.end : dateRange.start) : selectedDate}
            mode="date"
            onChange={handleDateSelect}
            maximumDate={new Date()}
          />
        )
      )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.elevation.level2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  categorySection: {
    backgroundColor: colors.elevation.level2,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onBackground,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  categoryName: {
    fontSize: 16,
    color: colors.onBackground,
  },
  categoryTime: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryContainer,
  },
  periodText: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onBackground,
    marginBottom: 16,
    textAlign: 'center',
  },
  periodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
  },
  selectedPeriod: {
    backgroundColor: colors.primaryContainer,
  },
  periodOptionText: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  selectedPeriodText: {
    color: colors.primary,
    fontWeight: '600',
  },
})

export default Stats