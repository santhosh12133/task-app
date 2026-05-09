import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import Card from '../ui/Card';

export default function WeeklyProgress({ data = [] }) {
  const chartData = (data.length ? data : [12, 18, 24, 20, 30, 28, 35]).map((value, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    value,
  }));

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Weekly progress</p>
          <h3 className="mt-2 text-2xl font-black text-text">Momentum curve</h3>
        </div>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="day" stroke="rgba(148, 163, 184, 0.65)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 16, color: '#fff' }} />
            <Bar dataKey="value" radius={[14, 14, 0, 0]} fill="url(#progressGradient)" />
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
