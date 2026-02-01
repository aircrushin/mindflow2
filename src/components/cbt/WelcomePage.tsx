import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Shield } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-sage/5 to-lavender/5 flex flex-col">
      {/* Header with Logo and User Menu */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-medium text-foreground">MindFlow AI</span>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-sm"
        >
          {/* Logo / Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sage/30 to-lavender/30 flex items-center justify-center shadow-lg">
              <span className="text-5xl">🌿</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-semibold text-foreground mb-3"
          >
            情绪急救站
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mb-8 leading-relaxed"
          >
            当情绪来袭时，给自己几分钟
            <br />
            用科学的方法找回内心的平静
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-3 mb-10"
          >
            <FeatureItem
              icon={<Heart className="w-4 h-4" />}
              text="识别并命名你的情绪"
              delay={0.6}
            />
            <FeatureItem
              icon={<Sparkles className="w-4 h-4" />}
              text="温和地重构消极想法"
              delay={0.7}
            />
            <FeatureItem
              icon={<Shield className="w-4 h-4" />}
              text="找到帮助你缓解的小行动"
              delay={0.8}
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-sage hover:bg-sage/90 text-sage-foreground px-10 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              开始
            </Button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-xs text-muted-foreground/70 mt-8"
          >
            只需要 3-5 分钟 · 完全私密
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}

function FeatureItem({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3 text-sm text-muted-foreground"
    >
      <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-sage">
        {icon}
      </div>
      <span>{text}</span>
    </motion.div>
  );
}
