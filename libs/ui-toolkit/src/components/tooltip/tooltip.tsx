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

const tooltipContentClasses =
  'max-w-sm bg-vega-light-100 dark:bg-vega-dark-100 border border-vega-light-200 dark:border-vega-dark-200 px-2 py-1 z-20 rounded text-xs text-black dark:text-white break-word';
export interface TooltipProps {
  children: React.ReactElement;
  description?: string | ReactNode;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

export const TOOLTIP_TRIGGER_CLASS_NAME =
  'underline underline-offset-2 decoration-neutral-400 dark:decoration-neutral-400 decoration-dashed';

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({
  children,
  description,
  open,
  sideOffset,
  align = 'start',
  side = 'bottom',
}: TooltipProps) =>
  description ? (
    <Provider delayDuration={200} skipDelayDuration={100}>
      <Root open={open}>
        <Trigger asChild className={TOOLTIP_TRIGGER_CLASS_NAME}>
          {children}
        </Trigger>
        {description && (
          <Portal>
            <Content
              align={align}
              side={side}
              alignOffset={8}
              className={tooltipContentClasses}
              sideOffset={sideOffset}
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
    <div className={tooltipContentClasses} role="tooltip">
      {props.value}
    </div>
  );
};
