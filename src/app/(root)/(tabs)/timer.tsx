import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../../theme/colors'
import { TimerState, TimerInterval } from '../../../types/timer'
import { createStudyLog, addInterval } from '@/src/utils/supabase'
import { router, useLocalSearchParams } from 'expo-router'
import { Category } from '@/src/types/database'
import { supabase } from '@/src/lib/supabase'
import { CustomInput } from '../../../components/CustomInput'

const Timer = () => {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [intervals, setIntervals] = useState<TimerInterval[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [title, setTitle] = useState('')

  const params = useLocalSearchParams()
  const categoryId = params.categoryId as string

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        setSelectedCategory(null)
        return
      }
      let { data: category, error } = await supabase
        .from('category')
        .select("*")
        .eq('id', categoryId)
        .single()
      if (error) {
        console.error(error)
        return
      }
      if (category) {
        setSelectedCategory(category)
      }
    }
    fetchCategory()
  }, [categoryId])

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
        const sessionTitle = title.trim() || 'Study Session'
        const studyLog = await createStudyLog(sessionTitle, selectedCategory?.id)
        setCurrentLogId(studyLog.id)
        setTimerState('studying')
        setStartTime(now)
        setIntervals([])
      } else {
        if (!currentLogId) throw new Error('No active study log')

        // Save interval to database
        await addInterval(
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

      // Save final interval only if timer is not idle
      if (timerState !== 'idle') {
        await addInterval(
          currentLogId,
          timerState === 'studying',
          new Date(startTime),
          new Date(now)
        )
      }

      // Reset everything
      setTimerState('idle')
      setIntervals([])
      setStartTime(0)
      setCurrentLogId(null)
      setTitle('')
      // Navigate back to reset the screen state completely
      router.push('/(root)/(tabs)/timer')
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
      <View style={styles.statHeader}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={colors.primary}
        />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statTime}>{time}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <CustomInput
            label=''
            value={title}
            onChangeText={setTitle}
            placeholder="Enter session title"
            style={[
              styles.titleInput,
              { opacity: timerState === 'idle' ? 1 : 0 }
            ]}
          />
          <Text style={[
            styles.sessionTitle,
            { opacity: timerState === 'idle' ? 0 : 1 }
          ]}>
            {title.trim() || 'Study Session'}
          </Text>
        </View>
        
        <Text style={styles.currentTime}>{getCurrentSessionTime()}</Text>
        <Text style={styles.timerState}>
          {timerState === 'idle' ? 'Ready to start' :
            timerState === 'studying' ? 'Studying' : 'Resting'}
        </Text>

        <View style={styles.actionContainer}>
          <Pressable 
            style={[
              styles.categoryButton,
              { opacity: timerState !== 'idle' ? 0.5 : 1 }
            ]} 
            onPress={() => {
              if (timerState !== 'idle') return;
              if (selectedCategory) {
                setSelectedCategory(null);
                router.push('/(root)/(tabs)/timer');
              } else {
                router.navigate('/(root)/categories');
              }
            }}
          >
            <FontAwesome
              name={selectedCategory?.icon_name as any}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.categoryButtonText}>
              {selectedCategory ? selectedCategory.name : 'Add Category'}
            </Text>
            {selectedCategory && timerState === 'idle' && (
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.primary}
              />
            )}
          </Pressable>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.finishButton,
                { opacity: timerState === 'idle' ? 0 : 1 }
              ]}
              onPress={handleFinish}
              disabled={timerState === 'idle'}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                Finish Session
              </Text>
            </Pressable>

            <Pressable
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
            </Pressable>
          </View>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  currentTime: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 20,
    marginBottom: 4,
  },
  timerState: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onPrimaryContainer,
  },
  statsContainer: {
    width: '100%',
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    minWidth: 90,
    justifyContent: 'space-between',
  },
  statHeader: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
    height: 40, // Add this line
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 16,
    minHeight: '100%',
  },
  sessionTitle: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
  },
  titleContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  titleInput: {
    position: 'absolute',
    width: '100%',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 100, 
  },
})

export default Timer