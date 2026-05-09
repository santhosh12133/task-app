import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[120px] w-full rounded-3xl border border-line bg-panel/80 px-4 py-3 text-sm text-text placeholder:text-muted shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20',
        className
      )}
      {...props}
    />
  );
});

export default Textarea;
