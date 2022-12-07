import type { ReactNode } from 'react';
import type { VegaTxState } from '@vegaprotocol/wallet';
import {
  VegaTxStatus,
  WalletError,
  useVegaWallet,
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { useOrderSubmit, OrderFeedback } from '@vegaprotocol/orders';
import { Schema } from '@vegaprotocol/types';
import { Button, Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useCallback, useMemo } from 'react';

export interface DealTicketManagerProps {
  market: MarketDealTicket;
  children?: ReactNode | ReactNode[];
}

interface ErrorContentProps {
  transaction: VegaTxState;
  reset: () => void;
}
const ErrorContent = ({ transaction, reset }: ErrorContentProps) => {
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const { disconnect } = useVegaWallet();
  const reconnect = useCallback(async () => {
    reset();
    await disconnect();
    openVegaWalletDialog();
  }, [reset, disconnect, openVegaWalletDialog]);
  return useMemo(() => {
    const { error } = transaction;
    if (error) {
      if (error instanceof WalletError && error.code === 100) {
        return (
          <ul data-testid="connectors-list" className="mb-6">
            <li className="mb-4 last:mb-0" data-testid={transaction.status}>
              {t('The connection to the vega wallet has been lost')}
            </li>
            <li className="mb-0 border-t pt-4">
              <Button onClick={reconnect}>{t('Reconnect vega wallet')}</Button>
            </li>
          </ul>
        );
      }
      return (
        <p data-testid={transaction.status}>
          {error.message}: {error.data}
        </p>
      );
    }
    return null;
  }, [transaction, reconnect]);
};

export const DealTicketManager = ({
  market,
  children,
}: DealTicketManagerProps) => {
  const { submit, transaction, finalizedOrder, Dialog, reset } =
    useOrderSubmit();
  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={(order) => submit(order)}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}
      <Dialog
        title={getOrderDialogTitle(finalizedOrder?.status)}
        intent={getOrderDialogIntent(finalizedOrder?.status)}
        icon={getOrderDialogIcon(finalizedOrder?.status)}
        content={{
          Complete: (
            <OrderFeedback transaction={transaction} order={finalizedOrder} />
          ),
          Error: <ErrorContent transaction={transaction} reset={reset} />,
        }}
      />
    </>
  );
};

export const getOrderDialogTitle = (
  status?: Schema.OrderStatus
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_ACTIVE:
      return t('Order submitted');
    case Schema.OrderStatus.STATUS_FILLED:
      return t('Order filled');
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return t('Order partially filled');
    case Schema.OrderStatus.STATUS_PARKED:
      return t('Order parked');
    case Schema.OrderStatus.STATUS_STOPPED:
      return t('Order stopped');
    case Schema.OrderStatus.STATUS_CANCELLED:
      return t('Order cancelled');
    case Schema.OrderStatus.STATUS_EXPIRED:
      return t('Order expired');
    case Schema.OrderStatus.STATUS_REJECTED:
      return t('Order rejected');
    default:
      return t('Submission failed');
  }
};

export const getOrderDialogIntent = (
  status?: Schema.OrderStatus
): Intent | undefined => {
  if (!status) {
    return;
  }
  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
    case Schema.OrderStatus.STATUS_PARTIALLY_FILLED:
      return Intent.Warning;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return Intent.Danger;
    case Schema.OrderStatus.STATUS_FILLED:
    case Schema.OrderStatus.STATUS_ACTIVE:
      return Intent.Success;
    default:
      return;
  }
};

export const getOrderDialogIcon = (
  status?: Schema.OrderStatus
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.OrderStatus.STATUS_PARKED:
    case Schema.OrderStatus.STATUS_EXPIRED:
      return <Icon name="warning-sign" />;
    case Schema.OrderStatus.STATUS_REJECTED:
    case Schema.OrderStatus.STATUS_STOPPED:
    case Schema.OrderStatus.STATUS_CANCELLED:
      return <Icon name="error" />;
    default:
      return;
  }
};
