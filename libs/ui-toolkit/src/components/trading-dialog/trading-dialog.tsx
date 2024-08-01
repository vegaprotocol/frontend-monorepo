import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { VegaIcon, VegaIconNames } from '../icon';
import { type ReactNode } from 'react';

type TradingDialogProps = {
  title: NonNullable<ReactNode>;
  description?: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TradingDialog = ({
  title,
  description,
  children,
  open,
  onOpenChange,
}: TradingDialogProps) => {
  return (
    <DialogPrimitives.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay
          className="fixed inset-0 bg-vega-clight-900/80 dark:bg-vega-cdark-900/80 z-20"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={classNames(
            'fixed top-0 left-0 z-20 flex justify-center items-start overflow-auto',
            'w-full h-full'
          )}
        >
          <div
            className={classNames(
              'z-20 relative top-[5vw] pb-[5vw]',
              'w-10/12 max-w-[512px]',
              'mx-auto'
            )}
          >
            <div
              data-testid="dialog-content"
              className={classNames(
                'border rounded-md',
                'p-8',
                'border-vega-clight-600 dark:border-vega-cdark-600',
                'bg-vega-clight-900 dark:bg-vega-cdark-900',
                'text-vega-clight-50 dark:text-vega-cdark-50'
              )}
            >
              <div className={classNames('flex justify-between items-center')}>
                <DialogPrimitives.Title className="text-3xl font-alpha calt">
                  {title}
                </DialogPrimitives.Title>
                <DialogPrimitives.Close>
                  <button className="w-6 h-6">
                    <VegaIcon name={VegaIconNames.CROSS} size={24} />
                  </button>
                </DialogPrimitives.Close>
              </div>
              {description && (
                <DialogPrimitives.Description className="mt-6">
                  {description}
                </DialogPrimitives.Description>
              )}
              {/** CUSTOM DIALOG CONTENT */}
              <div className="mt-6">{children}</div>
            </div>
          </div>
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
};
