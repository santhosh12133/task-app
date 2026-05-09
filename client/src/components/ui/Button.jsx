import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Button = forwardRef(function Button(
  { className = '', variant = 'primary', size = 'md', as: Component = 'button', type = 'button', ...props },
  ref
) {
  const variants = {
    primary:
      'bg-accent text-white border border-accent/30 hover:bg-accent/90 hover:border-accent/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50',
    secondary:
      'bg-panel/40 hover:bg-panel/60 text-text border border-accent/10 hover:border-accent/20 transition-all duration-300 disabled:opacity-50',
    ghost:
      'bg-transparent text-text hover:bg-panel/50 border border-transparent hover:border-white/5 transition-all duration-300 disabled:opacity-50',
    danger:
      'bg-danger text-white border border-danger/30 hover:bg-danger/90 hover:border-danger/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-50',
    outline:
      'bg-transparent text-text border border-accent/25 hover:bg-accent/10 hover:border-accent/35 transition-all duration-300 disabled:opacity-50',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-base gap-2 rounded-xl',
    xl: 'h-13 px-8 text-base gap-2 rounded-2xl',
  };

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:transform-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export default Button;
