import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { StudyLog } from '@/src/types/database'
import { supabase } from '@/src/lib/supabase'
import { SafeAreaView } from 'react-native-safe-area-context'

const LogDetails = () => {
    const [log, setLog] = useState<StudyLog>()
    const params = useLocalSearchParams()
    const logId = params.logId as string

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

    return (
        <SafeAreaView>
            <Text>{log?.title}</Text>
            <Text>{log?.category?.name}</Text>
        </SafeAreaView>
    )
}

export default LogDetails