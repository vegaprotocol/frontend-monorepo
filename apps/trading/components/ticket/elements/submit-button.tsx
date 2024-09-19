import { cn } from '@vegaprotocol/ui-toolkit';

import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
import { Intent, Button } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useFundsAvailable } from '../../../lib/hooks/use-funds-available';
import { useTicketContext } from '../ticket-context';
import {
  SidebarAccountsViewType,
  useSidebar,
  useSidebarAccountsInnerView,
  ViewType,
} from 'apps/trading/lib/hooks/use-sidebar';
import { toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const SubmitButton = ({ text }: { text: string }) => {
  const t = useT();

  const connected = useWallet(
    (store) => store.status === 'connected' && store.current !== 'viewParty'
  );
  const openDialog = useDialogStore((store) => store.open);

  const setSidebarView = useSidebar((store) => store.setView);
  const setSidebarInnerView = useSidebarAccountsInnerView(
    (store) => store.setView
  );

  const openDeposit = (assetId: string) => {
    setSidebarView(ViewType.Assets);
    setSidebarInnerView([SidebarAccountsViewType.Deposit, assetId]);
  };

  const { fundsAvailable } = useFundsAvailable();
  const ticket = useTicketContext();

  const form = useForm();
  const side = form.watch('side');

  const buttonProps = {
    size: 'lg',
    className: 'w-full',
    intent: Intent.Secondary,
  } as const;

  if (!connected) {
    return (
      <Button {...buttonProps} onClick={openDialog}>
        {t('Connect')}
      </Button>
    );
  }

  const asset =
    ticket.type === 'default'
      ? ticket.settlementAsset
      : side === Side.SIDE_BUY
      ? ticket.quoteAsset // buying with quote
      : ticket.baseAsset; // selling with base

  const funds = fundsAvailable?.find((f) => f.asset.id === asset.id);
  const amount = funds ? toBigNum(funds.balance, asset.decimals) : BigNumber(0);

  if (amount.isZero()) {
    return (
      <Button
        {...buttonProps}
        onClick={() => {
          openDeposit(asset.id);
        }}
      >
        {t('Deposit')}
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
