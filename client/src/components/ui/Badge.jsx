import { cn } from '../../lib/cn';

export default function Badge({ className = '', tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-panel/80 text-text border border-line',
    blue: 'bg-accent/15 text-accent border border-accent/20',
    success: 'bg-success/15 text-success border border-success/20',
    warning: 'bg-warning/15 text-warning border border-warning/20',
    danger: 'bg-danger/15 text-danger border border-danger/20',
  };

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
}
