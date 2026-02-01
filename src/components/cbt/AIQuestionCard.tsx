import { motion } from 'framer-motion';
import { TypewriterText } from './TypewriterText';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIQuestionCardProps {
  questions: string[];
  isLoading: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function AIQuestionCard({ questions, isLoading, showRetry, onRetry }: AIQuestionCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-lavender/10 rounded-3xl p-5 border border-lavender/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-lavender animate-pulse" />
          <span className="text-sm font-medium text-lavender-foreground">AI 正在思考...</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-lavender/20 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-lavender/20 rounded-full w-1/2 animate-pulse" />
        </div>
      </motion.div>
    );
  }

  // 显示重试状态
  if (showRetry && questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-lavender/10 rounded-3xl p-5 border border-lavender/20"
      >
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm text-muted-foreground text-center">
            AI 暂时无法回应，请稍后重试
          </p>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="rounded-xl border-lavender/40 hover:bg-lavender/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重新获取
          </Button>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-lavender/10 rounded-3xl p-5 border border-lavender/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-lavender" />
        <span className="text-sm font-medium text-lavender-foreground">让我们一起思考...</span>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.5 }}
            className="pl-4 border-l-2 border-lavender/40"
          >
            <TypewriterText
              text={question}
              speed={25}
              className="text-foreground leading-relaxed"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
