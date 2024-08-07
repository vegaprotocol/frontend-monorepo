import type { ReactNode } from 'react';
import React from 'react';
import {
  Provider,
  Root,
  Trigger,
  Content,
  Portal,
  Arrow,
} from '@radix-ui/react-tooltip';
import type { ITooltipParams } from 'ag-grid-community';

const tooltipContentClasses =
  'max-w-sm bg-gs-800 border-gs-700 px-2 py-1 z-20 rounded text-default break-word';
export interface TooltipProps {
  children: React.ReactElement;
  description?: string | ReactNode;
  open?: boolean;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  delayDuration?: number;
  arrow?: boolean;
}

// Conditionally rendered tooltip if description content is provided.
export const Tooltip = ({
  children,
  description,
  open,
  sideOffset,
  align = 'start',
  side = 'bottom',
  delayDuration = 200,
  arrow = true,
}: TooltipProps) =>
  description ? (
    <Provider delayDuration={delayDuration} skipDelayDuration={100}>
      <Root open={open}>
        <Trigger
          asChild
          className="underline underline-offset-2 decoration-gs-100 decoration-dashed"
        >
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
              {arrow && <Arrow width={16} height={8} className="fill-gs-500" />}
            </Content>
          </Portal>
        )}
      </Root>
    </Provider>
  ) : (
    children
  );

export const TooltipCellComponent = (props: ITooltipParams) => {
  return <p className={tooltipContentClasses}>{props.value}</p>;
};
