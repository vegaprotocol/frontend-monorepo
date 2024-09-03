import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const HeaderPage = (props: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn('text-4xl lg:text-5xl', props.className)}>
      {props.children}
    </h1>
  );
};
