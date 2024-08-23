import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';

export const HeaderPage = (props: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn('text-3xl lg:text-5xl calt', props.className)}>
      {props.children}
    </h1>
  );
};
