import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-2xl border border-line/90 bg-panel/70 px-4 text-sm text-text placeholder:text-muted/70 outline-none transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 hover:bg-panel/80',
        className
      )}
      {...props}
    />
  );
});

export default Input;
