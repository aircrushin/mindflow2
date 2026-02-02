import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CBTSession } from '@/hooks/useCBTHistory';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EmotionTrendChartProps {
  sessions: CBTSession[];
}

export function EmotionTrendChart({ sessions }: EmotionTrendChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 days
    const today = new Date();
    const startDate = subDays(today, 13);
    const days = eachDayOfInterval({ start: startDate, end: today });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessions.filter(
        s => format(new Date(s.completed_at), 'yyyy-MM-dd') === dateStr
      );

      // Calculate average intensity for the day
      const intensities = daySessions
        .map(s => s.emotion_intensity)
        .filter((i): i is number => i !== null);

      const avgIntensity = intensities.length > 0
        ? Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length)
        : null;

      return {
        date: format(day, 'M/d', { locale: zhCN }),
        fullDate: format(day, 'M月d日', { locale: zhCN }),
        intensity: avgIntensity,
        count: daySessions.length,
      };
    });
  }, [sessions]);

  // Calculate trend
  const trend = useMemo(() => {
    const validData = chartData.filter(d => d.intensity !== null);
    if (validData.length < 2) return 'stable';

    const firstHalf = validData.slice(0, Math.floor(validData.length / 2));
    const secondHalf = validData.slice(Math.floor(validData.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + (b.intensity || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + (b.intensity || 0), 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 1) return 'up';
    if (diff < -1) return 'down';
    return 'stable';
  }, [chartData]);

  const hasData = chartData.some(d => d.intensity !== null);

  if (!hasData) {
    return (
      <div className="bg-card rounded-3xl soft-shadow p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">情绪强度趋势</h3>
        <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
          暂无数据，完成练习后将显示趋势
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl soft-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">近两周情绪强度趋势</h3>
        <div className="flex items-center gap-1.5">
          {trend === 'up' && (
            <>
              <TrendingUp className="w-4 h-4 text-coral" />
              <span className="text-xs text-coral">上升</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown className="w-4 h-4 text-sage" />
              <span className="text-xs text-sage">下降</span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <Minus className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">平稳</span>
            </>
          )}
        </div>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              ticks={[0, 5, 10]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                if (data.intensity === null) return null;

                return (
                  <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-foreground">{data.fullDate}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      平均强度: <span className="text-lavender font-medium">{data.intensity}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      记录次数: {data.count}
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="hsl(var(--lavender))"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--lavender))', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'hsl(var(--lavender))', strokeWidth: 0, r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        数值越低表示情绪状态越好
      </p>
    </div>
  );
}
