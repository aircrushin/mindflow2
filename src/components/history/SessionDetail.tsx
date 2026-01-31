import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { CBTSession } from '@/hooks/useCBTHistory';
import { EMOTIONS, COGNITIVE_DISTORTIONS, ACTION_RECOMMENDATIONS } from '@/types/cbt';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface SessionDetailProps {
  session: CBTSession | null;
  open: boolean;
  onClose: () => void;
}

export function SessionDetail({ session, open, onClose }: SessionDetailProps) {
  if (!session) return null;

  const emotion = EMOTIONS.find(e => e.id === session.selected_emotion);
  const distortions = session.detected_distortions?.map(id => 
    COGNITIVE_DISTORTIONS.find(d => d.id === id)
  ).filter(Boolean) ?? [];
  const action = ACTION_RECOMMENDATIONS.find(a => a.id === session.selected_action);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            {emotion && <span className="text-2xl">{emotion.icon}</span>}
            <span>{session.custom_emotion || emotion?.label || '情绪记录'}</span>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(session.completed_at), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Step 1: Emotion */}
          <Section title="第一步：情绪命名" color="sage">
            <div className="space-y-3">
              <InfoRow label="情绪强度">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(session.emotion_intensity ?? 0) * 10}%` }}
                      className="h-full bg-sage rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium w-6">{session.emotion_intensity}</span>
                </div>
              </InfoRow>
              {session.body_sensation && (
                <InfoRow label="身体感受">
                  <p className="text-foreground">{session.body_sensation}</p>
                </InfoRow>
              )}
            </div>
          </Section>

          {/* Step 2: Cognitive Restructuring */}
          <Section title="第二步：认知重构" color="sky">
            <div className="space-y-3">
              {session.automatic_thought && (
                <InfoRow label="自动思维">
                  <p className="text-foreground">{session.automatic_thought}</p>
                </InfoRow>
              )}
              {distortions.length > 0 && (
                <InfoRow label="认知偏误">
                  <div className="flex flex-wrap gap-2">
                    {distortions.map(d => d && (
                      <span key={d.id} className="text-xs px-2 py-1 rounded-full bg-sky/20 text-sky">
                        {d.name}
                      </span>
                    ))}
                  </div>
                </InfoRow>
              )}
              {session.ai_questions && session.ai_questions.length > 0 && (
                <InfoRow label="苏格拉底式提问">
                  <ul className="space-y-2">
                    {session.ai_questions.map((q, i) => (
                      <li key={i} className="text-sm text-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-sky">
                        {q}
                      </li>
                    ))}
                  </ul>
                </InfoRow>
              )}
              {session.balanced_thought && (
                <InfoRow label="平衡思维">
                  <p className="text-foreground">{session.balanced_thought}</p>
                </InfoRow>
              )}
            </div>
          </Section>

          {/* Step 3: Micro Action */}
          <Section title="第三步：微小行动" color="lavender">
            {action && (
              <div className="flex items-center gap-3 p-3 bg-lavender/10 rounded-xl">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            )}
          </Section>
        </div>

        <div className="mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full rounded-2xl"
          >
            关闭
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colorClasses = {
    sage: 'border-sage/30 bg-sage/5',
    sky: 'border-sky/30 bg-sky/5',
    lavender: 'border-lavender/30 bg-lavender/5',
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <h3 className="font-medium text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      {children}
    </div>
  );
}
