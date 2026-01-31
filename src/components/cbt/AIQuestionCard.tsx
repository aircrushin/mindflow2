import { motion } from 'framer-motion';
import { TypewriterText } from './TypewriterText';
import { Sparkles } from 'lucide-react';

interface AIQuestionCardProps {
  questions: string[];
  isLoading: boolean;
}

export function AIQuestionCard({ questions, isLoading }: AIQuestionCardProps) {
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
