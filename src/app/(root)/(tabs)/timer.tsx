import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../../theme/colors'
import { TimerState, TimerInterval } from '../../../types/timer'
import { createStudyLog, addInterval } from '@/src/utils/supabase'

const Timer = () => {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [intervals, setIntervals] = useState<TimerInterval[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (timerState !== 'idle') {
      setCurrentTime(Date.now())
      intervalId = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [timerState])

  const handleTimerPress = async () => {
    const now = Date.now()
    
    try {
      setIsLoading(true)
      
      if (timerState === 'idle') {
        // Create new study log when starting
        const studyLog = await createStudyLog('Study Session') // You might want to add category or custom title
        setCurrentLogId(studyLog.id)
        setTimerState('studying')
        setStartTime(now)
        setIntervals([])
      } else {
        if (!currentLogId) throw new Error('No active study log')
        
        // Add interval to database
        const newInterval = await addInterval(
          currentLogId,
          timerState === 'studying',
          new Date(startTime),
          new Date(now)
        )
        
        // Update local state
        const mappedInterval: TimerInterval = {
          type: timerState === 'studying' ? 'study' : 'rest',
          duration: now - startTime,
          startTime: startTime,
          endTime: now
        }
        setIntervals([...intervals, mappedInterval])
        
        // Update timer state
        if (timerState === 'studying') {
          setTimerState('resting')
        } else {
          setTimerState('studying')
        }
        setStartTime(now)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save study session')
      console.error(error)
      // Reset to idle state on error
      setTimerState('idle')
      setCurrentLogId(null)
      setIntervals([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!currentLogId) return
    
    try {
      setIsLoading(true)
      const now = Date.now()
      
      // Save final interval
      await addInterval(
        currentLogId,
        timerState === 'studying',
        new Date(startTime),
        new Date(now)
      )
      
      // Reset everything
      setTimerState('idle')
      setIntervals([])
      setStartTime(0)
      setCurrentLogId(null)
    } catch (error) {
      Alert.alert('Error', 'Failed to save final interval')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalTime = (type?: 'study' | 'rest') => {
    let total = intervals
      .filter(interval => !type || interval.type === type)
      .reduce((sum, interval) => sum + interval.duration, 0)
      
    // Add current active interval
    if (timerState !== 'idle') {
      const currentType = timerState === 'studying' ? 'study' : 'rest'
      if (!type || type === currentType) {
        total += currentTime - startTime
      }
    }
    
    return total
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const getCurrentSessionTime = () => {
    if (timerState === 'idle') return '0:00'
    return formatTime(currentTime - startTime)
  }

  const renderStatCard = (icon: string, label: string, time: string) => (
    <View style={styles.statCard}>
      <MaterialCommunityIcons 
        name={icon as any} 
        size={24} 
        color={colors.primary} 
      />
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statTime}>{time}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.currentTime}>{getCurrentSessionTime()}</Text>
      <Text style={styles.timerState}>
        {timerState === 'idle' ? 'Ready to start' : 
         timerState === 'studying' ? 'Studying' : 'Resting'}
      </Text>
      
      {timerState !== 'idle' && (
        <TouchableOpacity 
          style={[styles.button, styles.finishButton]}
          onPress={handleFinish}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            Finish Session
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[
          styles.button,
          {
            backgroundColor: timerState === 'studying' 
              ? colors.study.background 
              : timerState === 'resting'
              ? colors.rest.background
              : colors.primaryContainer,
            opacity: isLoading ? 0.7 : 1
          }
        ]}
        onPress={handleTimerPress}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Saving...' :
           timerState === 'idle' ? 'Start Studying' :
           timerState === 'studying' ? 'Take a Rest' : 'Continue Studying'}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'book-open-variant',
          'Study Time',
          formatTime(getTotalTime('study'))
        )}
        {renderStatCard(
          'coffee',
          'Rest Time',
          formatTime(getTotalTime('rest'))
        )}
        {renderStatCard(
          'clock-outline',
          'Session Time',
          formatTime(getTotalTime())
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: 20,
  },
  currentTime: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 40,
    marginBottom: 8,
  },
  timerState: {
    fontSize: 20,
    color: colors.onSurfaceVariant,
    marginBottom: 40,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onPrimaryContainer,
  },
  statsContainer: {
    width: '100%',
    marginTop: 40,
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    gap: 16,
  },
  statLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  statTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
})

export default Timer