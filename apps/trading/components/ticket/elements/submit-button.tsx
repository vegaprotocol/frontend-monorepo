import { cn, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';
import { useDialogStore, useWallet } from '@vegaprotocol/wallet-react';
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
import { type ReactNode } from 'react';
import omit from 'lodash/omit';

type SubmitButtonProps = {
  type: 'button' | 'submit';
  side: Side | 'indeterminate';
  disabled: boolean;
  onClick?: () => void;
  children: ReactNode;
};

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

  const { fundsAvailable, loading: fundsLoading } = useFundsAvailable();
  const ticket = useTicketContext();

  const form = useForm();
  const side = form.watch('side');

  const asset =
    ticket.type === 'default'
      ? ticket.settlementAsset
      : side === Side.SIDE_BUY
      ? ticket.quoteAsset // buying with quote
      : ticket.baseAsset; // selling with base

  const funds = fundsAvailable?.find((f) => f.asset.id === asset.id);
  const amount = funds ? toBigNum(funds.balance, asset.decimals) : BigNumber(0);
  const needsDeposit = !fundsLoading && amount.isZero();

  let p: SubmitButtonProps = {
    type: 'button',
    side,
    disabled: true,
    onClick: undefined,
    children: text,
  };

  if (!connected) {
    p = {
      type: 'button',
      side: 'indeterminate',
      disabled: false,
      onClick: openDialog,
      children: t('Connect'),
    };
  } else if (fundsLoading) {
    p = {
      type: 'button',
      side,
      disabled: true,
      onClick: undefined,
      children: (
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'
          )}
        >
          <VegaIcon
            size={18}
            name={VegaIconNames.LOADING}
            className="animate-spin text-white"
          />
        </div>
      ),
    };
  } else if (needsDeposit) {
    p = {
      type: 'button',
      side: 'indeterminate',
      disabled: false,
      onClick: () => {
        openDeposit(asset.id);
      },
      children: t('Deposit'),
    };
  } else {
    p = {
      type: 'submit',
      side,
      disabled: false,
      onClick: undefined,
      children: text,
    };
  }

  return (
    <button
      data-testid="place-order"
      {...omit(p, 'children', 'side')}
      className={cn(
        'w-full h-12 flex flex-col justify-center items-center rounded-button-lg text-white p-2 transition-all',
        'relative',
        {
          'bg-red-500 enabled:hover:bg-red-550 dark:bg-red-600 dark:enabled:hover:bg-red-650':
            p.side === Side.SIDE_SELL,
          'bg-green-600 enabled:hover:bg-green-650 dark:bg-green-650 dark:enabled:hover:bg-green-600':
            p.side === Side.SIDE_BUY,
          'bg-intent-secondary': p.side === 'indeterminate',
        }
      )}
    >
      {p.children}
    </button>
  );
};
