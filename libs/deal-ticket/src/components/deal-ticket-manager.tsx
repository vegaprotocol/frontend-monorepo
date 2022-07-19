import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTransactionDialog, VegaTxStatus } from '@vegaprotocol/wallet';
import { DealTicket } from './deal-ticket';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import type { OrderEvent_busEvents_event_Order } from '@vegaprotocol/orders';
import { useOrderSubmit } from '@vegaprotocol/orders';
import { OrderStatus, OrderType } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';

export interface DealTicketManagerProps {
  market: DealTicketQuery_market;
  children?: ReactNode | ReactNode[];
}

export const DealTicketManager = ({
  market,
  children,
}: DealTicketManagerProps) => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const { submit, transaction, finalizedOrder, reset } = useOrderSubmit(market);

  let title;
  let intent;
  let icon;
  let dialogContent;

  if (finalizedOrder) {
    title = getDialogTitle(finalizedOrder);

    if (finalizedOrder.status === OrderStatus.Rejected) {
      icon = <Icon name="cross" size={20} />;
      intent = Intent.Danger;
      dialogContent = (
        <p data-testid="error-reason">
          {t(`Reason: ${finalizedOrder.rejectionReason}`)}
        </p>
      );
    }

    icon = <Icon name="tick" size={20} />;
    intent = Intent.Success;
    dialogContent = (
      <OrderSuccessContent order={finalizedOrder} transaction={transaction} />
    );
  }

  return (
    <>
      {children || (
        <DealTicket
          market={market}
          submit={(order) => {
            setOrderDialogOpen(true);
            submit(order);
          }}
          transactionStatus={
            transaction.status === VegaTxStatus.Requested ||
            transaction.status === VegaTxStatus.Pending
              ? 'pending'
              : 'default'
          }
        />
      )}

      <VegaTransactionDialog
        isOpen={orderDialogOpen}
        onChange={(isOpen) => {
          setOrderDialogOpen(isOpen);
          if (!isOpen) {
            reset();
          }
        }}
        transaction={transaction}
        intent={intent}
        title={title}
        icon={icon}
      >
        {dialogContent}
      </VegaTransactionDialog>
    </>
  );
};

const getDialogTitle = (finalizedOrder: OrderEvent_busEvents_event_Order) => {
  switch (finalizedOrder.status) {
    case OrderStatus.Active:
      return 'Order submitted';
    case OrderStatus.Filled:
      return 'Order filled';
    case OrderStatus.PartiallyFilled:
      return 'Order partially filled';
    case OrderStatus.Parked:
      return 'Order parked';
    default:
      return undefined;
  }
};

interface OrderSuccessContentProps {
  order: OrderEvent_busEvents_event_Order;
  transaction: VegaTxState;
}

const OrderSuccessContent = ({
  order,
  transaction,
}: OrderSuccessContentProps) => {
  const headerClassName = 'text-h5 font-bold text-black dark:text-white';
  const { VEGA_EXPLORER_URL } = useEnvironment();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {order.market && (
          <div>
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${order.market.name}`)}</p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Status`)}</p>
          <p>{t(`${order.status}`)}</p>
        </div>
        {order.type === OrderType.Limit && order.market && (
          <div>
            <p className={headerClassName}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Amount`)}</p>
          <p
            className={
              order.side === 'Buy' ? 'text-vega-green' : 'text-vega-red'
            }
          >
            {`${order.side === 'Buy' ? '+' : '-'} ${order.size}
            `}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {transaction.txHash && (
          <div>
            <p className={headerClassName}>{t(`Transaction`)}</p>
            <a
              className="underline break-words"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {transaction.txHash}
            </a>
          </div>
        )}
      </div>
    </>
  );
};
