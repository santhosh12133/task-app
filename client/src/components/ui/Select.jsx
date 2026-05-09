import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-2xl border border-line bg-panel/80 px-4 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;
