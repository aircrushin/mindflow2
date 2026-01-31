import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw, Check, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSaveSession } from '@/hooks/useCBTHistory';
import { CBTSessionState } from '@/types/cbt';

interface CompletionCelebrationProps {
  onReset: () => void;
  sessionData: CBTSessionState;
}

const encouragements = [
  '你做得很棒！✨',
  '每一步都是进步 💪',
  '感谢你照顾自己的情绪 💝',
  '你比想象中更坚强 🌟',
  '这份努力值得被看见 🌈',
];

export function CompletionCelebration({ onReset, sessionData }: CompletionCelebrationProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveSession, isLoggedIn } = useSaveSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasSaved = useRef(false);

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  // Save session on mount if logged in
  useEffect(() => {
    if (isLoggedIn && !hasSaved.current) {
      hasSaved.current = true;
      setSaving(true);
      saveSession({
        customEmotion: sessionData.customEmotion,
        selectedEmotion: sessionData.selectedEmotion,
        emotionIntensity: sessionData.emotionIntensity,
        bodySensation: sessionData.bodySensation,
        automaticThought: sessionData.automaticThought,
        detectedDistortions: sessionData.detectedDistortions,
        aiQuestions: sessionData.aiQuestions,
        balancedThought: sessionData.balancedThought,
        selectedAction: sessionData.selectedAction,
      }).then(({ error }) => {
        setSaving(false);
        if (!error) {
          setSaved(true);
        }
      });
    }
  }, [isLoggedIn, saveSession, sessionData]);

  useEffect(() => {
    // 轻柔的 confetti 效果
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const colors = ['#C5B9E0', '#B8D4E3', '#9CAF88', '#FFD700'];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        gravity: 0.8,
        scalar: 0.8,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        gravity: 0.8,
        scalar: 0.8,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center space-y-8 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto rounded-full bg-lavender/20 flex items-center justify-center"
      >
        <Heart className="w-12 h-12 text-lavender fill-lavender/50" />
      </motion.div>

      <div className="space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-foreground"
        >
          情绪急救完成！
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-lavender"
        >
          {randomEncouragement}
        </motion.p>
      </div>

      {/* Save status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        {isLoggedIn ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-sage" />
                <span className="text-sage">已保存到历史记录</span>
              </>
            ) : null}
          </div>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>登录后可保存记录</span>
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-3xl p-6 soft-shadow max-w-sm mx-auto"
      >
        <p className="text-muted-foreground leading-relaxed">
          记住，情绪是暂时的。你刚刚用了几分钟时间，
          <span className="text-foreground font-medium">认真地照顾了自己</span>。
          这本身就是一种力量。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-2xl px-6 h-12 border-lavender/30 hover:bg-lavender/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          开始新的练习
        </Button>
        {isLoggedIn && (
          <Button
            onClick={() => navigate('/history')}
            variant="ghost"
            className="rounded-2xl px-6 h-12"
          >
            查看历史记录
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
