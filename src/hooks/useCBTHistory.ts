import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface CBTSession {
  id: string;
  user_id: string;
  completed_at: string;
  custom_emotion: string | null;
  selected_emotion: string | null;
  emotion_intensity: number | null;
  body_sensation: string | null;
  automatic_thought: string | null;
  detected_distortions: string[] | null;
  ai_questions: string[] | null;
  balanced_thought: string | null;
  selected_action: string | null;
}

export function useCBTHistory(selectedMonth: Date) {
  const { user } = useAuth();

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['cbt-sessions', user?.id, format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) return [];

      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('cbt_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', start.toISOString())
        .lte('completed_at', end.toISOString())
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return data as CBTSession[];
    },
    enabled: !!user,
  });

  // Get dates that have sessions
  const sessionDates = sessions?.map(s => format(new Date(s.completed_at), 'yyyy-MM-dd')) ?? [];
  const uniqueDates = [...new Set(sessionDates)];

  // Get sessions for a specific date
  const getSessionsByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions?.filter(s => format(new Date(s.completed_at), 'yyyy-MM-dd') === dateStr) ?? [];
  };

  return {
    sessions,
    isLoading,
    refetch,
    sessionDates: uniqueDates,
    getSessionsByDate,
  };
}

export function useSaveSession() {
  const { user } = useAuth();

  const saveSession = async (sessionData: {
    customEmotion: string;
    selectedEmotion: string | null;
    emotionIntensity: number;
    bodySensation: string;
    automaticThought: string;
    detectedDistortions: string[];
    aiQuestions: string[];
    balancedThought: string;
    selectedAction: string | null;
  }) => {
    if (!user) return { error: new Error('用户未登录') };

    const { error } = await supabase
      .from('cbt_sessions')
      .insert({
        user_id: user.id,
        custom_emotion: sessionData.customEmotion || null,
        selected_emotion: sessionData.selectedEmotion,
        emotion_intensity: sessionData.emotionIntensity,
        body_sensation: sessionData.bodySensation || null,
        automatic_thought: sessionData.automaticThought || null,
        detected_distortions: sessionData.detectedDistortions.length > 0 ? sessionData.detectedDistortions : null,
        ai_questions: sessionData.aiQuestions.length > 0 ? sessionData.aiQuestions : null,
        balanced_thought: sessionData.balancedThought || null,
        selected_action: sessionData.selectedAction,
      });

    if (error) {
      console.error('Error saving session:', error);
      return { error: new Error('保存失败') };
    }

    return { error: null };
  };

  return { saveSession, isLoggedIn: !!user };
}
