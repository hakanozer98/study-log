import { supabase } from '../lib/supabase'
import { StudyLog, Interval } from '@/src/types/database'

export async function createStudyLog(title: string, categoryId?: string): Promise<StudyLog> {
  const { data, error } = await supabase
    .from('study_log')
    .insert({ title, category_id: categoryId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addInterval(
  studyLogId: string,
  isStudy: boolean,
  startTime: Date,
  endTime: Date
): Promise<Interval> {
  const { data, error } = await supabase
    .from('interval')
    .insert({
      study_log_id: studyLogId,
      is_study: isStudy,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}