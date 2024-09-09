import { cn } from '@vegaprotocol/ui-toolkit';
import { type HTMLAttributes } from 'react';
import { GradientText } from '../gradient-text';

export const HeaderPage = (props: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn('text-4xl lg:text-5xl font-semibold', props.className)}>
      <GradientText>{props.children}</GradientText>
    </h1>
  );
};
