import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Phone, ShieldCheck, Heart } from 'lucide-react';

interface CrisisInterventionProps {
  onDismiss: () => void;
}

const hotlines = [
  { name: '全国心理援助热线', number: '400-161-9995' },
  { name: '北京心理危机研究与干预中心', number: '010-82951332' },
  { name: '生命热线', number: '400-821-1215' },
];

export function CrisisIntervention({ onDismiss }: CrisisInterventionProps) {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number.replace(/-/g, '')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-crisis/10 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-full max-w-md bg-card rounded-3xl p-6 shadow-2xl border border-crisis/20"
      >
        <div className="text-center space-y-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 mx-auto rounded-full bg-crisis/20 flex items-center justify-center"
          >
            <Heart className="w-8 h-8 text-crisis" />
          </motion.div>
          
          <h2 className="text-xl font-semibold text-foreground">
            你的感受很重要
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            如果你正在经历困难时刻，请记住：
            <br />
            <span className="text-foreground font-medium">有人愿意倾听，有人在乎你。</span>
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {hotlines.map((hotline, index) => (
            <motion.div
              key={hotline.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Button
                onClick={() => handleCall(hotline.number)}
                className="w-full h-14 rounded-2xl bg-crisis hover:bg-crisis/90 text-crisis-foreground justify-between px-5"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {hotline.name}
                </span>
                <span className="font-mono">{hotline.number}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full h-12 rounded-2xl border-muted hover:bg-muted"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            我暂时安全，继续练习
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          以上热线均为 24 小时免费服务
        </p>
      </motion.div>
    </motion.div>
  );
}
