import React, { ReactNode } from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
} from '@radix-ui/react-tooltip';

export interface TooltipProps {
  children: React.ReactElement;
  description?: string | ReactNode;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
}

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({ children, description, open, align }: TooltipProps) =>
  description ? (
    <Provider delayDuration={200} skipDelayDuration={100}>
      <Root open={open}>
        <Trigger asChild>{children}</Trigger>
        <Content align={align} alignOffset={8}>
          <div className="relative z-0 p-8 bg-black-50 border border-black-60 text-white rounded-sm max-w-sm">
            {description}
          </div>
          <Arrow
            width={10}
            height={5}
            className="z-[1] mx-8 fill-black-60 dark:fill-white-60 z-0 translate-x-[1px] translate-y-[-1px]"
          />
          <Arrow
            width={8}
            height={4}
            className="z-[1] mx-8 translate-y-[-1px] fill-black-50"
          />
        </Content>
      </Root>
    </Provider>
  ) : (
    children
  );
