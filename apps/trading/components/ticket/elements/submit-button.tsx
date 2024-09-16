import { cn } from '@vegaprotocol/ui-toolkit';

import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { Intent, Button } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useOnboardStore } from '../../../stores/onboard';
import { Link } from 'react-router-dom';
import { Links } from 'apps/trading/lib/links';

export const SubmitButton = ({ text }: { text: string }) => {
  const t = useT();
  const finishedOnboard = useOnboardStore((store) => store.finished);
  const connected = useWallet(
    (store) => store.status === 'connected' && store.current !== 'viewParty'
  );
  const openDialog = useDialogStore((store) => store.open);

  const form = useForm();
  const side = form.watch('side');

  const buttonProps = {
    size: 'lg',
    className: 'w-full',
    intent: Intent.Secondary,
  } as const;

  if (!finishedOnboard) {
    return (
      <Link to={Links.INVITE()}>
        <Button {...buttonProps}>{t('Get started')}</Button>
      </Link>
    );
  }

  if (!connected) {
    return (
      <Button {...buttonProps} onClick={openDialog}>
        {t('Connect')}
      </Button>
    );
  }

  return (
    <button
      data-testid="place-order"
      type="submit"
      className={cn(
        'w-full h-12 flex flex-col justify-center items-center rounded-button-lg text-white p-2 transition-colors',
        {
          'bg-red-500 enabled:hover:bg-red-550 dark:bg-red-600 dark:enabled:hover:bg-red-650':
            side === Side.SIDE_SELL,
          'bg-green-600 enabled:hover:bg-green-650 dark:bg-green-650 dark:enabled:hover:bg-green-600':
            side === Side.SIDE_BUY,
        }
      )}
    >
      {text}
    </button>
  );
};
