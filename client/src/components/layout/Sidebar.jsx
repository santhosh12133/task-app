import { CalendarDays, LayoutDashboard, NotebookTabs, Settings, Sparkles, Target } from 'lucide-react';
import Badge from '../ui/Badge';
import { cn } from '../../lib/cn';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: Target },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: NotebookTabs },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onChange, open, onClose }) {
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 bg-bg/90 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:bg-transparent', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="mb-8 flex items-center justify-between rounded-[28px] border border-white/10 bg-panel/70 px-4 py-4 shadow-glass">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Productivity suite</p>
          <h2 className="mt-1 text-2xl font-black text-text">Orion</h2>
        </div>
        <Badge tone="blue">Pro</Badge>
      </div>

      <nav className="space-y-2" aria-label="Primary navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => {
                onChange(item.id);
                onClose?.();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200',
                isActive ? 'border-accent/30 bg-accent/12 text-accent shadow-glow' : 'border-transparent bg-transparent text-muted hover:border-white/10 hover:bg-panel/50 hover:text-text'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-[28px] border border-white/10 bg-linear-to-br from-accent/20 to-transparent p-5 shadow-glass">
        <p className="text-sm font-semibold text-text">Focus streak</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-4xl font-black text-text">12</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">days</p>
          </div>
          <Target className="h-10 w-10 text-accent" />
        </div>
      </div>
    </aside>
  );
}
