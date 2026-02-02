import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCBTHistory, CBTSession } from '@/hooks/useCBTHistory';
import { HistoryCalendar } from '@/components/history/HistoryCalendar';
import { SessionList } from '@/components/history/SessionList';
import { SessionDetail } from '@/components/history/SessionDetail';
import { EmotionTrendChart } from '@/components/history/EmotionTrendChart';
import { Button } from '@/components/ui/button';

export default function History() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<CBTSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { sessions, isLoading, sessionDates, getSessionsByDate } = useCBTHistory(month);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleSessionClick = (session: CBTSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  const selectedDateSessions = selectedDate ? getSessionsByDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium">历史记录</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Emotion Trend Chart */}
          {sessions && sessions.length > 0 && (
            <EmotionTrendChart sessions={sessions} />
          )}

          {/* Calendar */}
          <div className="bg-card rounded-3xl soft-shadow overflow-hidden">
            <HistoryCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              sessionDates={sessionDates}
              month={month}
              onMonthChange={setMonth}
            />
          </div>

          {/* Session List */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                {format(selectedDate, 'M月d日', { locale: zhCN })} 的记录
              </h2>
              <SessionList
                sessions={selectedDateSessions}
                onSessionClick={handleSessionClick}
              />
            </motion.div>
          )}

          {!selectedDate && sessions && sessions.length > 0 && (
            <div className="text-center text-muted-foreground py-4">
              点击日历中的日期查看记录
            </div>
          )}

          {!selectedDate && (!sessions || sessions.length === 0) && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">本月还没有记录</p>
              <Button
                onClick={() => navigate('/')}
                className="rounded-2xl bg-sage hover:bg-sage/90 text-sage-foreground"
              >
                开始第一次练习
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Session Detail Sheet */}
      <SessionDetail
        session={selectedSession}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
