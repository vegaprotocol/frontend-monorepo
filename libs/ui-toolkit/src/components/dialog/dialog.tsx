import * as DialogPrimitives from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { Intent } from '../../utils/intent';
import { Icon } from '../icon';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange: (isOpen: boolean) => void;
  title?: string;
  intent?: Intent;
}

export function Dialog({
  children,
  open,
  onChange,
  title,
  intent,
}: DialogProps) {
  const contentClasses = classNames(
    // Positions the modal in the center of screen
    'fixed w-[520px] px-28 py-24 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
    // Need to apply background and text colors again as content is rendered in a portal
    'dark:bg-black dark:text-white-95 bg-white text-black-95',
    // For some reason if I use getIntentShadow from utils/intent the styles arent applied
    'shadow-callout',
    {
      'shadow-intent-danger': intent === Intent.Danger,
      'shadow-intent-warning': intent === Intent.Warning,
      'shadow-intent-prompt': intent === Intent.Prompt,
      'shadow-black dark:shadow-white': intent === Intent.Progress,
      'shadow-intent-success': intent === Intent.Success,
      'shadow-intent-help': intent === Intent.Help,
    }
  );
  return (
    <DialogPrimitives.Root open={open} onOpenChange={(x) => onChange(x)}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Overlay className="fixed inset-0 bg-black/50 dark:bg-white/15" />
        <DialogPrimitives.Content className={contentClasses}>
          <DialogPrimitives.Close className="p-12 absolute top-0 right-0">
            <Icon name="cross" />
          </DialogPrimitives.Close>
          {title && <h1 className="text-h5 mb-12">{title}</h1>}
          {children}
        </DialogPrimitives.Content>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
