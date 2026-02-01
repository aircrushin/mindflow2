import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CognitiveDistortionList } from './CognitiveDistortionTag';
import { AIQuestionCard } from './AIQuestionCard';
import { CrisisIntervention } from './CrisisIntervention';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { EmotionType } from '@/types/cbt';
import { supabase } from '@/integrations/supabase/client';

// 敏感词列表 - 检测可能需要危机干预的内容
const CRISIS_KEYWORDS = [
  '自杀', '想死', '不想活', '活不下去', '结束生命', '了结', '轻生',
  '自残', '割腕', '跳楼', '自伤', '伤害自己',
  '抑郁', '绝望', '没有希望', '活着没意思', '没有意义',
  '崩溃', '撑不住', '受不了了', '太痛苦',
];

// 检测文本是否包含敏感词
function detectCrisisKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

interface Step2Props {
  automaticThought: string;
  detectedDistortions: string[];
  aiQuestions: string[];
  balancedThought: string;
  selectedEmotion: EmotionType | null;
  onAutomaticThoughtChange: (value: string) => void;
  onAiQuestionsReceived: (questions: string[]) => void;
  onBalancedThoughtChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function Step2CognitiveRestructuring({
  automaticThought,
  detectedDistortions,
  aiQuestions,
  balancedThought,
  selectedEmotion,
  onAutomaticThoughtChange,
  onAiQuestionsReceived,
  onBalancedThoughtChange,
  onNext,
  onBack,
  canProceed,
}: Step2Props) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasRequestedAI, setHasRequestedAI] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [hasDismissedCrisis, setHasDismissedCrisis] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  // 监听输入变化，检测敏感词
  useEffect(() => {
    // 如果用户已经关闭过模态框，不再自动弹出（避免反复打扰）
    if (hasDismissedCrisis) return;
    
    if (detectCrisisKeywords(automaticThought) || detectCrisisKeywords(balancedThought)) {
      setShowCrisisModal(true);
    }
  }, [automaticThought, balancedThought, hasDismissedCrisis]);

  const handleDismissCrisis = () => {
    setShowCrisisModal(false);
    setHasDismissedCrisis(true);
  };

  const requestAIQuestions = useCallback(async () => {
    if (!automaticThought.trim() || isLoadingAI) return;

    setIsLoadingAI(true);
    setHasRequestedAI(true);
    setShowRetry(false);

    // 10秒超时控制
    const timeoutId = setTimeout(() => {
      if (isLoadingAI) {
        setIsLoadingAI(false);
        setShowRetry(true);
      }
    }, 10000);

    try {
      const { data, error } = await supabase.functions.invoke('socratic-questions', {
        body: {
          thought: automaticThought,
          emotion: selectedEmotion,
          distortions: detectedDistortions,
        },
      });

      clearTimeout(timeoutId);

      if (error) throw error;

      if (data?.questions && data.questions.length > 0) {
        onAiQuestionsReceived(data.questions);
        setShowRetry(false);
      } else {
        setShowRetry(true);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching AI questions:', error);
      setShowRetry(true);
    } finally {
      setIsLoadingAI(false);
    }
  }, [automaticThought, selectedEmotion, detectedDistortions, isLoadingAI, onAiQuestionsReceived]);

  const handleRetry = useCallback(() => {
    setHasRequestedAI(false);
    setShowRetry(false);
    onAiQuestionsReceived([]);
  }, [onAiQuestionsReceived]);

  return (
    <>
      {/* 危机干预模态框 */}
      {showCrisisModal && (
        <CrisisIntervention onDismiss={handleDismissCrisis} />
      )}

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">第二步：认知重构</h2>
        <p className="text-muted-foreground">识别并转化负面想法</p>
      </div>

      {/* 自动思维输入 */}
      <div className="bg-card rounded-3xl p-5 soft-shadow space-y-4">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            脑海里闪过的想法是什么？
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            不需要修饰，写下最原始的念头
          </p>
          <Textarea
            placeholder="例如：我肯定会搞砸这件事..."
            value={automaticThought}
            onChange={(e) => onAutomaticThoughtChange(e.target.value)}
            className="rounded-2xl border-sky-light focus:border-sky bg-background resize-none min-h-[100px]"
          />
        </div>

        {/* 认知偏误标签 */}
        {detectedDistortions.length > 0 && (
          <CognitiveDistortionList distortionIds={detectedDistortions} />
        )}

        {/* 获取 AI 问题按钮 */}
        {automaticThought.trim().length > 5 && !hasRequestedAI && (
          <Button
            onClick={requestAIQuestions}
            disabled={isLoadingAI}
            variant="outline"
            className="w-full rounded-2xl border-sky bg-sky-light hover:bg-sky/30 text-sky-foreground"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在生成引导问题...
              </>
            ) : (
              '✨ 获取 AI 引导问题'
            )}
          </Button>
        )}
      </div>

      {/* AI 苏格拉底式提问 */}
      {(isLoadingAI || aiQuestions.length > 0 || showRetry) && (
        <AIQuestionCard 
          questions={aiQuestions} 
          isLoading={isLoadingAI} 
          showRetry={showRetry}
          onRetry={handleRetry}
        />
      )}

      {/* 平衡思维输入 */}
      {aiQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 soft-shadow space-y-3"
        >
          <h3 className="text-lg font-medium text-foreground">
            更客观的想法是什么？
          </h3>
          <p className="text-sm text-muted-foreground">
            基于上面的思考，写下一个更平衡的观点
          </p>
          <Textarea
            placeholder="也许事情没有那么绝对..."
            value={balancedThought}
            onChange={(e) => onBalancedThoughtChange(e.target.value)}
            className="rounded-2xl border-sky-light focus:border-sky bg-background resize-none min-h-[80px]"
          />
        </motion.div>
      )}

      {/* 导航按钮 */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-muted text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          上一步
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-14 rounded-2xl bg-sky hover:bg-sky/90 text-sky-foreground text-lg font-medium shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          下一步
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
    </>
  );
}
