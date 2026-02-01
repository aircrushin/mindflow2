import { useState, useCallback } from 'react';
import { CBTSessionState, EmotionType, COGNITIVE_DISTORTIONS, CRISIS_KEYWORDS } from '@/types/cbt';

const initialState: CBTSessionState = {
  step: 0,
  customEmotion: '',
  emotionIntensity: 5,
  selectedEmotion: null,
  bodySensation: '',
  automaticThought: '',
  detectedDistortions: [],
  aiQuestions: [],
  balancedThought: '',
  selectedAction: null,
  actionCompleted: false,
  showCrisisIntervention: false,
};

export function useCBTSession() {
  const [state, setState] = useState<CBTSessionState>(initialState);

  const setStep = useCallback((step: 0 | 1 | 2 | 3) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setCustomEmotion = useCallback((emotion: string) => {
    setState(prev => ({ ...prev, customEmotion: emotion }));
  }, []);

  const setEmotionIntensity = useCallback((intensity: number) => {
    setState(prev => ({ ...prev, emotionIntensity: intensity }));
  }, []);

  const setSelectedEmotion = useCallback((emotion: EmotionType) => {
    setState(prev => ({ ...prev, selectedEmotion: emotion }));
  }, []);

  const setBodySensation = useCallback((sensation: string) => {
    setState(prev => ({ ...prev, bodySensation: sensation }));
  }, []);

  const setAutomaticThought = useCallback((thought: string) => {
    // 检测认知偏误
    const distortions: string[] = [];
    COGNITIVE_DISTORTIONS.forEach(distortion => {
      if (distortion.keywords.some(keyword => thought.includes(keyword))) {
        distortions.push(distortion.id);
      }
    });

    // 检测危机关键词
    const hasCrisisKeyword = CRISIS_KEYWORDS.some(keyword => thought.includes(keyword));

    setState(prev => ({
      ...prev,
      automaticThought: thought,
      detectedDistortions: distortions,
      showCrisisIntervention: hasCrisisKeyword,
    }));
  }, []);

  const setAiQuestions = useCallback((questions: string[]) => {
    setState(prev => ({ ...prev, aiQuestions: questions }));
  }, []);

  const setBalancedThought = useCallback((thought: string) => {
    setState(prev => ({ ...prev, balancedThought: thought }));
  }, []);

  const setSelectedAction = useCallback((actionId: string) => {
    setState(prev => ({ ...prev, selectedAction: actionId }));
  }, []);

  const completeAction = useCallback(() => {
    setState(prev => ({ ...prev, actionCompleted: true }));
  }, []);

  const dismissCrisis = useCallback(() => {
    setState(prev => ({ ...prev, showCrisisIntervention: false }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const canProceedToStep2 = state.selectedEmotion !== null || state.customEmotion.trim().length > 0;
  const canProceedToStep3 = state.automaticThought.trim().length > 0;

  return {
    state,
    setCustomEmotion,
    setStep,
    setEmotionIntensity,
    setSelectedEmotion,
    setBodySensation,
    setAutomaticThought,
    setAiQuestions,
    setBalancedThought,
    setSelectedAction,
    completeAction,
    dismissCrisis,
    reset,
    canProceedToStep2,
    canProceedToStep3,
  };
}
