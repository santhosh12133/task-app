import Card from '../ui/Card';

const stats = [
  { label: 'Tasks completed', value: '128', sub: '+18 this week' },
  { label: 'Focus streak', value: '12d', sub: 'Best 21 days' },
  { label: 'AI suggestions used', value: '46', sub: '9 today' },
  { label: 'Completion rate', value: '87%', sub: 'Up 11%' },
];

export default function StatsStrip({ summary }) {
  const mapped = summary
    ? [
        { label: 'Total tasks', value: summary.totalTasks },
        { label: 'Completed', value: summary.completedTasks },
        { label: 'Pending', value: summary.pendingTasks },
        { label: 'Completion rate', value: `${summary.completionRate}%` },
      ]
    : stats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {mapped.map((stat) => (
        <Card key={stat.label} className="border-white/10">
          <p className="text-sm text-muted">{stat.label}</p>
          <div className="mt-3 text-4xl font-black text-text">{stat.value}</div>
          {stat.sub ? <p className="mt-2 text-sm text-muted">{stat.sub}</p> : null}
        </Card>
      ))}
    </div>
  );
}
