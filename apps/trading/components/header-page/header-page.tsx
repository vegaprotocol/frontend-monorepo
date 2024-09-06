import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const HeaderPage = (props: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn('text-4xl lg:text-5xl font-semibold', props.className)}>
      <span className="bg-clip-text text-transparent bg-gradient-to-tl from-highlight-fg to-highlight-fg via-highlight-secondary-fg via-30%">
        {props.children}
      </span>
    </h1>
  );
};
