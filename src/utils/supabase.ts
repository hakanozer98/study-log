import { supabase } from '../lib/supabase'
import { StudyLog, Interval } from '@/src/types/database'

export const createStudyLog = async (title: string, categoryId?: string) => {
  const { data, error } = await supabase
    .from('study_log')
    .insert([{ title, category_id: categoryId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

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

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const createCategory = async (name: string, color: string, iconName: string) => {
  const { data, error } = await supabase
    .from('category')
    .insert([{ name, color, icon_name: iconName }])
    .select()
    .single();

  if (error) throw error;
  return data;
};