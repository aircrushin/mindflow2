import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface ProgressBarProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, label: '情绪命名', color: 'sage' },
  { number: 2, label: '认知重构', color: 'sky' },
  { number: 3, label: '微小行动', color: 'lavender' },
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Steps */}
          <div className="flex items-center flex-1">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: currentStep === step.number ? 1.1 : 1,
                    }}
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                      currentStep === step.number && step.color === 'sage' && 'bg-sage text-sage-foreground shadow-lg',
                      currentStep === step.number && step.color === 'sky' && 'bg-sky text-sky-foreground shadow-lg',
                      currentStep === step.number && step.color === 'lavender' && 'bg-lavender text-lavender-foreground shadow-lg',
                      currentStep > step.number && 'bg-muted text-muted-foreground',
                      currentStep < step.number && 'bg-muted/50 text-muted-foreground/50'
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'text-xs mt-1 transition-colors duration-300',
                      currentStep === step.number ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="w-8 sm:w-12 h-0.5 mx-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: currentStep > step.number ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className={cn(
                        'h-full',
                        step.color === 'sage' && 'bg-sage',
                        step.color === 'sky' && 'bg-sky',
                        step.color === 'lavender' && 'bg-lavender'
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
