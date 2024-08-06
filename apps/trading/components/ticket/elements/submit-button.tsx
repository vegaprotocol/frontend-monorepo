import classNames from 'classnames';

import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';

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
        className={classNames(
          'w-full h-12 flex flex-col justify-center items-center rounded-lg text-vega-clight-800 p-2 transition-colors',
          {
            'bg-vega-red-500 enabled:hover:bg-vega-red-550 dark:bg-vega-red-600 dark:enabled:hover:bg-vega-red-650':
              side === Side.SIDE_SELL,
            'bg-vega-green-600 enabled:hover:bg-vega-green-650 dark:bg-vega-green-650 dark:enabled:hover:bg-vega-green-600':
              side === Side.SIDE_BUY,
          }
        )}
      >
        {text}
      </button>
    );
  }

  return (
    <TradingButton size="large" intent={Intent.Secondary} onClick={openDialog}>
      {t('Connect')}
    </TradingButton>
  );
};
