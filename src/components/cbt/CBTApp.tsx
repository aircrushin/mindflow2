import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { WelcomePage } from './WelcomePage';
import { Step1EmotionNaming } from './Step1EmotionNaming';
import { Step2CognitiveRestructuring } from './Step2CognitiveRestructuring';
import { Step3MicroActions } from './Step3MicroActions';
import { CrisisIntervention } from './CrisisIntervention';
import { useCBTSession } from '@/hooks/useCBTSession';

export function CBTApp() {
  const {
    state,
    setStep,
    setCustomEmotion,
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
  } = useCBTSession();

  // 欢迎页面单独渲染
  if (state.step === 0) {
    return <WelcomePage onStart={() => setStep(1)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 危机干预弹窗 */}
      <AnimatePresence>
        {state.showCrisisIntervention && (
          <CrisisIntervention onDismiss={dismissCrisis} />
        )}
      </AnimatePresence>

      {/* 进度条 */}
      <ProgressBar currentStep={state.step} />

      {/* 主内容区 */}
      <main className="max-w-md mx-auto px-6 pt-28 pb-12">
        <AnimatePresence mode="wait">
          {state.step === 1 && (
            <Step1EmotionNaming
              key="step1"
              customEmotion={state.customEmotion}
              emotionIntensity={state.emotionIntensity}
              selectedEmotion={state.selectedEmotion}
              bodySensation={state.bodySensation}
              onCustomEmotionChange={setCustomEmotion}
              onIntensityChange={setEmotionIntensity}
              onEmotionSelect={setSelectedEmotion}
              onBodySensationChange={setBodySensation}
              onNext={() => setStep(2)}
              canProceed={canProceedToStep2}
            />
          )}

          {state.step === 2 && (
            <Step2CognitiveRestructuring
              key="step2"
              automaticThought={state.automaticThought}
              detectedDistortions={state.detectedDistortions}
              aiQuestions={state.aiQuestions}
              balancedThought={state.balancedThought}
              selectedEmotion={state.selectedEmotion}
              emotionIntensity={state.emotionIntensity}
              bodySensation={state.bodySensation}
              onAutomaticThoughtChange={setAutomaticThought}
              onAiQuestionsReceived={setAiQuestions}
              onBalancedThoughtChange={setBalancedThought}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              canProceed={canProceedToStep3}
            />
          )}

          {state.step === 3 && (
            <Step3MicroActions
              key="step3"
              selectedEmotion={state.selectedEmotion}
              selectedAction={state.selectedAction}
              actionCompleted={state.actionCompleted}
              sessionData={state}
              onSelectAction={setSelectedAction}
              onCompleteAction={completeAction}
              onBack={() => setStep(2)}
              onReset={reset}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
