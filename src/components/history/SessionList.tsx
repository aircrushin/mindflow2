import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CBTSession } from '@/hooks/useCBTHistory';
import { EMOTIONS } from '@/types/cbt';

interface SessionListProps {
  sessions: CBTSession[];
  onSessionClick: (session: CBTSession) => void;
}

export function SessionList({ sessions, onSessionClick }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        这一天没有记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => {
        const emotion = EMOTIONS.find(e => e.id === session.selected_emotion);
        
        return (
          <motion.button
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSessionClick(session)}
            className="w-full text-left bg-card rounded-2xl p-4 soft-shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {emotion && (
                  <span className="text-2xl">{emotion.icon}</span>
                )}
                <div>
                  <div className="font-medium text-foreground">
                    {session.custom_emotion || emotion?.label || '情绪记录'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(session.completed_at), 'HH:mm', { locale: zhCN })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  强度
                </div>
                <div className="w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center text-sm font-medium text-lavender">
                  {session.emotion_intensity}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
