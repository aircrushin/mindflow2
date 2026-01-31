import { motion } from 'framer-motion';
import { COGNITIVE_DISTORTIONS } from '@/types/cbt';
import { cn } from '@/lib/utils';

interface CognitiveDistortionTagProps {
  distortionId: string;
  index: number;
}

export function CognitiveDistortionTag({ distortionId, index }: CognitiveDistortionTagProps) {
  const distortion = COGNITIVE_DISTORTIONS.find(d => d.id === distortionId);
  
  if (!distortion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'bg-lavender/20 text-lavender-foreground border border-lavender/30',
        'text-sm font-medium'
      )}
    >
      <span className="w-2 h-2 rounded-full bg-lavender" />
      {distortion.name}
    </motion.div>
  );
}

interface CognitiveDistortionListProps {
  distortionIds: string[];
}

export function CognitiveDistortionList({ distortionIds }: CognitiveDistortionListProps) {
  if (distortionIds.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-3"
    >
      <p className="text-sm text-muted-foreground">
        检测到的认知偏误：
      </p>
      <div className="flex flex-wrap gap-2">
        {distortionIds.map((id, index) => (
          <CognitiveDistortionTag key={id} distortionId={id} index={index} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">
        💡 认知偏误是大脑的自动反应，识别它们是改变的第一步
      </p>
    </motion.div>
  );
}
