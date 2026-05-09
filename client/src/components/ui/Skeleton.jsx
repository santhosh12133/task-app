import { cn } from '../../lib/cn';

export default function Skeleton({ className = '' }) {
  return <div className={cn('animate-shimmer rounded-2xl bg-linear-to-r from-white/5 via-white/20 to-white/5 bg-size-[200%_100%]', className)} />;
}
