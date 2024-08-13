import * as DialogPrimitives from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';
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
          className="fixed inset-0 bg-gs-900/80 z-20"
          data-testid="dialog-overlay"
        />
        <DialogPrimitives.Content
          className={cn(
            'fixed top-0 left-0 z-20 flex justify-center items-start overflow-auto',
            'w-full h-full'
          )}
        >
          <div
            className={cn(
              'z-20 relative top-[5vw] pb-[5vw]',
              'w-10/12 max-w-[512px]',
              'mx-auto'
            )}
          >
            <div
              data-testid="dialog-content"
              className={cn(
                'border rounded-md',
                'p-8',
                'border-gs-600 ',
                'bg-gs-900',
                'text-gs-50 '
              )}
            >
              <div className={cn('flex justify-between items-center')}>
                <DialogPrimitives.Title className="text-3xl font-alt calt">
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
