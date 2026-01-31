import { motion } from 'framer-motion';
import { EmotionThermometer } from './EmotionThermometer';
import { EmotionButton } from './EmotionButton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EMOTIONS, EmotionType } from '@/types/cbt';
import { ArrowRight } from 'lucide-react';

interface Step1Props {
  customEmotion: string;
  emotionIntensity: number;
  selectedEmotion: EmotionType | null;
  bodySensation: string;
  onCustomEmotionChange: (value: string) => void;
  onIntensityChange: (value: number) => void;
  onEmotionSelect: (emotion: EmotionType) => void;
  onBodySensationChange: (value: string) => void;
  onNext: () => void;
  canProceed: boolean;
}

export function Step1EmotionNaming({
  customEmotion,
  emotionIntensity,
  selectedEmotion,
  bodySensation,
  onCustomEmotionChange,
  onIntensityChange,
  onEmotionSelect,
  onBodySensationChange,
  onNext,
  canProceed,
}: Step1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">第一步：认识情绪</h2>
        <p className="text-muted-foreground">感受当下的情绪，给它命名</p>
      </div>

      {/* 自定义情绪输入 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-foreground">用一个词描述你的感受</h3>
        <Input
          placeholder="例如：迷茫、委屈、烦躁..."
          value={customEmotion}
          onChange={(e) => onCustomEmotionChange(e.target.value)}
          className="rounded-2xl border-sage-light focus:border-sage bg-card h-12"
        />
      </div>

      {/* 情绪温度计 */}
      <div className="bg-card rounded-3xl p-6 soft-shadow">
        <EmotionThermometer value={emotionIntensity} onChange={onIntensityChange} />
      </div>

      {/* 情绪选择 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">你现在最强烈的感受是？</h3>
        <div className="grid grid-cols-3 gap-3">
          {EMOTIONS.map((emotion) => (
            <EmotionButton
              key={emotion.id}
              emotion={emotion}
              isSelected={selectedEmotion === emotion.id}
              onClick={() => onEmotionSelect(emotion.id)}
            />
          ))}
        </div>
      </div>

      {/* 身体感受 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-foreground">
          这种感觉在身体的哪个部位？
        </h3>
        <p className="text-sm text-muted-foreground">
          例如：胸口发紧、肩膀僵硬、胃里翻腾...
        </p>
        <Textarea
          placeholder="描述你的身体感受..."
          value={bodySensation}
          onChange={(e) => onBodySensationChange(e.target.value)}
          className="rounded-2xl border-sage-light focus:border-sage bg-card resize-none min-h-[80px]"
        />
      </div>

      {/* 下一步按钮 */}
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full h-14 rounded-2xl bg-sage hover:bg-sage/90 text-sage-foreground text-lg font-medium shadow-lg transition-all duration-300 disabled:opacity-50"
      >
        下一步
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
