import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EmotionOption } from '@/types/cbt';
import { useCallback, useRef } from 'react';

interface EmotionButtonProps {
  emotion: EmotionOption;
  isSelected: boolean;
  onClick: () => void;
}

export function EmotionButton({ emotion, isSelected, onClick }: EmotionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // 创建涟漪效果
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    onClick();
  }, [onClick]);

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center',
        'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'bg-sage text-sage-foreground shadow-lg'
          : 'bg-sage-light text-foreground hover:bg-sage/30'
      )}
    >
      <span className="text-2xl sm:text-3xl mb-1">{emotion.icon}</span>
      <span className="text-xs sm:text-sm font-medium">{emotion.label}</span>
    </motion.button>
  );
}
