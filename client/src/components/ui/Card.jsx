import { cn } from '../../lib/cn';

export default function Card({ className = '', children, glass = true, hover = false }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-all duration-300',
        glass
          ? 'border-accent/10 bg-gradient-to-br from-panel/55 to-panelAlt/30 backdrop-blur-xl shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_12px_40px_rgba(0,0,0,0.35)]'
          : 'border-line bg-panel shadow-none',
        hover && 'hover:border-accent/20 hover:bg-gradient-to-br hover:from-panel/60 hover:to-panelAlt/35 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
}

