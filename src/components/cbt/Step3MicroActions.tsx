import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActionCard } from './ActionCard';
import { CompletionCelebration } from './CompletionCelebration';
import { ACTION_RECOMMENDATIONS, EmotionType, CBTSessionState } from '@/types/cbt';
import { ArrowLeft } from 'lucide-react';

interface Step3Props {
  selectedEmotion: EmotionType | null;
  selectedAction: string | null;
  actionCompleted: boolean;
  sessionData: CBTSessionState;
  onSelectAction: (actionId: string) => void;
  onCompleteAction: () => void;
  onBack: () => void;
  onReset: () => void;
}

export function Step3MicroActions({
  selectedEmotion,
  selectedAction,
  actionCompleted,
  sessionData,
  onSelectAction,
  onCompleteAction,
  onBack,
  onReset,
}: Step3Props) {
  const recommendedActions = useMemo(() => {
    if (!selectedEmotion) return ACTION_RECOMMENDATIONS.slice(0, 3);
    return ACTION_RECOMMENDATIONS.filter(
      (action) => action.emotionType === selectedEmotion
    );
  }, [selectedEmotion]);

  if (actionCompleted) {
    return <CompletionCelebration onReset={onReset} sessionData={sessionData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">第三步：微小行动</h2>
        <p className="text-muted-foreground">选择一个 5 分钟内能完成的小事</p>
      </div>

      {/* 行动推荐 */}
      <div className="space-y-3">
        {recommendedActions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={selectedAction === action.id}
            onSelect={() => {
              if (selectedAction === action.id) {
                onCompleteAction();
              } else {
                onSelectAction(action.id);
              }
            }}
            index={index}
          />
        ))}
      </div>

      {/* 提示文字 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        💡 不需要完美，只要开始就是胜利
      </motion.p>

      {/* 返回按钮 */}
      <Button
        onClick={onBack}
        variant="outline"
        className="w-full h-14 rounded-2xl border-muted text-muted-foreground hover:bg-muted"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        返回上一步
      </Button>
    </motion.div>
  );
}
