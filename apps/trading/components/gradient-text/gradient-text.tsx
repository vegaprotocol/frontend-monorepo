import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const GradientText = (props: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-tr from-highlight-fg via-highlight-secondary-fg to-highlight-tertiary-fg via-30%',
        props.className
      )}
    >
      {props.children}
    </span>
  );
};
