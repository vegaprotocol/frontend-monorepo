import { cn } from '@vegaprotocol/ui-toolkit';

import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { Intent, Button } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';

export const SubmitButton = ({ text }: { text: string }) => {
  const t = useT();
  const connected = useWallet(
    (store) => store.status === 'connected' && store.current !== 'viewParty'
  );
  const openDialog = useDialogStore((store) => store.open);

  const form = useForm();
  const side = form.watch('side');

  if (connected) {
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
  }

  return (
    <Button size="lg" intent={Intent.Secondary} onClick={openDialog}>
      {t('Connect')}
    </Button>
  );
};
