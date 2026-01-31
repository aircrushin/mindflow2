import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface EmotionThermometerProps {
  value: number;
  onChange: (value: number) => void;
}

export function EmotionThermometer({ value, onChange }: EmotionThermometerProps) {
  const getEmoji = (val: number) => {
    if (val <= 2) return '😌';
    if (val <= 4) return '😐';
    if (val <= 6) return '😟';
    if (val <= 8) return '😣';
    return '😭';
  };

  const getLabel = (val: number) => {
    if (val <= 2) return '轻微';
    if (val <= 4) return '有些困扰';
    if (val <= 6) return '中等强烈';
    if (val <= 8) return '非常强烈';
    return '极度强烈';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">情绪强度</span>
        <div className="flex items-center gap-2">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl"
          >
            {getEmoji(value)}
          </motion.span>
          <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
      </div>

      <div className="relative pt-2 pb-1">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full emotion-slider-track" />
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={10}
          step={1}
          className={cn(
            '[&_[role=slider]]:h-6 [&_[role=slider]]:w-6',
            '[&_[role=slider]]:bg-card [&_[role=slider]]:border-2 [&_[role=slider]]:border-sage',
            '[&_[role=slider]]:shadow-md',
            '[&_.relative]:bg-transparent',
            '[&_.absolute]:bg-transparent'
          )}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground"
        >
          {getLabel(value)}
        </motion.span>
        <span>10</span>
      </div>
    </div>
  );
}
