import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { EMOTIONS, COGNITIVE_DISTORTIONS, ACTION_RECOMMENDATIONS } from '@/types/cbt';
import { CBTSessionState } from '@/types/cbt';

interface ShareCardProps {
  sessionData: CBTSessionState;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ sessionData }, ref) => {
    const emotion = sessionData.selectedEmotion
      ? EMOTIONS.find((e) => e.id === sessionData.selectedEmotion)
      : null;

    const distortions = sessionData.detectedDistortions
      .map((id) => COGNITIVE_DISTORTIONS.find((d) => d.id === id))
      .filter(Boolean);

    const action = sessionData.selectedAction
      ? ACTION_RECOMMENDATIONS.find((a) => a.id === sessionData.selectedAction)
      : null;

    const currentDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="w-[360px] bg-gradient-to-br from-background via-background to-lavender-light p-6 rounded-3xl shadow-2xl border border-border/50"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-sage/20 px-4 py-2 rounded-full mb-3">
            <span className="text-2xl">🧠</span>
            <span className="font-semibold text-sage-foreground text-sm">MINDFLOW</span>
          </div>
          <p className="text-xs text-muted-foreground">{currentDate}</p>
        </div>

        {/* Step 1: 情绪命名 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-sage-light/50 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-sage text-sage-foreground flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="font-medium text-sm text-foreground">我的情绪</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emotion?.icon || '😶'}</span>
            <div>
              <p className="font-semibold text-foreground">
                {sessionData.customEmotion || emotion?.label || '未命名'}
              </p>
              <p className="text-xs text-muted-foreground">
                强度：{sessionData.emotionIntensity}/10
              </p>
            </div>
          </div>
          {sessionData.bodySensation && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              身体感受：{sessionData.bodySensation}
            </p>
          )}
        </motion.div>

        {/* Step 2: 认知重构 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sky-light/50 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-sky text-sky-foreground flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="font-medium text-sm text-foreground">认知重构</h3>
          </div>

          {sessionData.automaticThought && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">原始想法</p>
              <p className="text-sm text-foreground bg-background/50 rounded-xl p-2 leading-relaxed">
                "{sessionData.automaticThought}"
              </p>
            </div>
          )}

          {distortions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">识别到的思维模式</p>
              <div className="flex flex-wrap gap-1">
                {distortions.map((d) => (
                  <span
                    key={d!.id}
                    className="px-2 py-0.5 bg-sky/30 text-sky-foreground text-xs rounded-full"
                  >
                    {d!.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sessionData.balancedThought && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">✨ 平衡思维</p>
              <p className="text-sm text-foreground bg-background/50 rounded-xl p-2 leading-relaxed font-medium">
                "{sessionData.balancedThought}"
              </p>
            </div>
          )}
        </motion.div>

        {/* Step 3: 行动 */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-lavender-light/50 rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-lavender text-lavender-foreground flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h3 className="font-medium text-sm text-foreground">我的行动</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{action.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.duration}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 底部鼓励语 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-2 border-t border-border/30"
        >
          <p className="text-sm text-lavender font-medium mb-1">
            今天，我照顾了自己的情绪 💜
          </p>
          <p className="text-xs text-muted-foreground">mindflow2.lovable.app</p>
        </motion.div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
