import type { ReactNode } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { getIntentBackground, getIntentText } from '../../utils/intent';
import type { Intent } from '../../utils/intent';

interface LozengeProps {
  children: ReactNode;
  intent?: Intent;
  className?: string;
}

export const Lozenge = ({ children, intent, className }: LozengeProps) => {
  return (
    <span
      className={cn(
        ['rounded-md', 'font-mono', 'leading-none', 'px-2 py-1'],
        getIntentBackground(intent),
        getIntentText(intent),
        className
      )}
    >
      {children}
    </span>
  );
};
