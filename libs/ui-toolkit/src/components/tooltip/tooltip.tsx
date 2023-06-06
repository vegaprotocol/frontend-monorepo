import type { ReactNode } from 'react';
import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Portal,
} from '@radix-ui/react-tooltip';
import type { ITooltipParams } from 'ag-grid-community';

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
          className="underline underline-offset-2 decoration-neutral-400 dark:decoration-neutral-400 decoration-dashed"
        >
          {children}
        </Trigger>
        {description && (
          <Portal>
            <Content
              align={align}
              side={side}
              alignOffset={8}
              className="max-w-sm border border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 z-20 rounded text-sm text-black dark:text-white break-word"
            >
              <div className="relative z-0" data-testid="tooltip-content">
                {description}
              </div>
            </Content>
          </Portal>
        )}
      </Root>
    </Provider>
  ) : (
    children
  );

export const TooltipCellComponent = (props: ITooltipParams) => {
  return (
    <p className="max-w-sm border border-neutral-600 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 z-20 rounded text-sm break-word text-black dark:text-white">
      {props.value}
    </p>
  );
};
