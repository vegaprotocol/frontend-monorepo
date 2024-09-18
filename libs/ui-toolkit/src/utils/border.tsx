import { cn } from './cn';

export const ColourfulBorder = ({ className }: { className?: string }) => (
  <div
    style={{
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'exclude',
    }}
    className={cn(
      'absolute inset-0 p-px bg-gradient-to-br rounded-grid pointer-events-none',
      'from-highlight to-highlight-secondary',
      className
    )}
  />
);
