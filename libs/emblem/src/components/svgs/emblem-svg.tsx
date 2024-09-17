import { type SVGAttributes } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';

export const EmblemSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      viewBox="0 0 32 32"
      {...props}
      className={cn('inline-block rounded-full', props.className)}
      width={props.width || 32}
      height={props.height || 32}
    >
      {props.children}
    </svg>
  );
};
