import type { ReactNode } from 'react';
import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
  Portal,
} from '@radix-ui/react-tooltip';

export interface TooltipProps {
  children: React.ReactElement;
  description?: string | ReactNode;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({
  children,
  description,
  open,
  align = 'start',
  side = 'bottom',
}: TooltipProps) =>
  description ? (
    <Provider delayDuration={200} skipDelayDuration={100}>
      <Root open={open}>
        <Trigger
          asChild
          className="underline underline-offset-2 decoration-neutral-400 dark:decoration-neutral-400 decoration-dashed cursor-help"
        >
          {children}
        </Trigger>
        {description && (
          <Portal>
            <Content
              align={align}
              side={side}
              alignOffset={8}
              className="max-w-sm bg-neutral-200 px-4 py-2 z-20 rounded text-sm break-word"
            >
              <div className="relative z-0">{description}</div>
              <Arrow
                width={10}
                height={5}
                className="fill-neutral-200 z-0 translate-x-[1px] translate-y-[-1px]"
              />
            </Content>
          </Portal>
        )}
      </Root>
    </Provider>
  ) : (
    children
  );
