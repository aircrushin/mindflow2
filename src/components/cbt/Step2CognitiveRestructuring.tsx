import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CognitiveDistortionList } from './CognitiveDistortionTag';
import { AIQuestionCard } from './AIQuestionCard';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { EmotionType } from '@/types/cbt';
import { supabase } from '@/integrations/supabase/client';

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

  const requestAIQuestions = useCallback(async () => {
    if (!automaticThought.trim() || isLoadingAI) return;

    setIsLoadingAI(true);
    setHasRequestedAI(true);

    try {
      const { data, error } = await supabase.functions.invoke('socratic-questions', {
        body: {
          thought: automaticThought,
          emotion: selectedEmotion,
          distortions: detectedDistortions,
        },
      });

      if (error) throw error;

      if (data?.questions) {
        onAiQuestionsReceived(data.questions);
      }
    } catch (error) {
      console.error('Error fetching AI questions:', error);
      // 提供备用问题
      onAiQuestionsReceived([
        '如果你最好的朋友有这样的想法，你会对TA说什么？',
        '有没有一些证据，可能和你现在想的不太一样？',
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  }, [automaticThought, selectedEmotion, detectedDistortions, isLoadingAI, onAiQuestionsReceived]);

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
      {(isLoadingAI || aiQuestions.length > 0) && (
        <AIQuestionCard questions={aiQuestions} isLoading={isLoadingAI} />
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
  );
}
