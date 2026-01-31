import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActionRecommendation } from '@/types/cbt';
import { Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: ActionRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export function ActionCard({ action, isSelected, onSelect, index }: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-3xl p-5 transition-all duration-300',
        'border-2',
        isSelected
          ? 'bg-lavender/20 border-lavender shadow-lg scale-[1.02]'
          : 'bg-card border-transparent hover:border-lavender/30 soft-shadow hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{action.icon}</div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-foreground">{action.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {action.description}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{action.duration}</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4"
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-full h-12 rounded-2xl bg-lavender hover:bg-lavender/90 text-lavender-foreground font-medium"
          >
            <Play className="mr-2 h-4 w-4" />
            现在就做
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
