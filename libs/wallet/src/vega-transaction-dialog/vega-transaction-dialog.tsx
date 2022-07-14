import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import type { VegaTxState } from '../use-vega-transaction';
import { VegaTxStatus } from '../use-vega-transaction';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { OrderType } from '@vegaprotocol/types';
import type { Order } from '../wallet-types';
import { FormGroup, Input, InputError, Button } from '@vegaprotocol/ui-toolkit';
import { useForm } from 'react-hook-form';

export interface VegaTransactionDialogProps {
  orderDialogOpen: boolean;
  setOrderDialogOpen: (isOpen: boolean) => void;
  finalizedOrder: Order | null;
  transaction: VegaTxState;
  reset: () => void;
  title?: string;
  edit?: (body?: unknown) => Promise<unknown>;
  editOrder?: Order | null;
}

const getDialogIntent = (
  finalizedOrder: Order | null,
  transaction: VegaTxState
) => {
  if (finalizedOrder) {
    return !finalizedOrder.rejectionReason ? Intent.Success : Intent.Danger;
  }
  switch (transaction.status) {
    case VegaTxStatus.Requested:
      return Intent.Warning;
    case VegaTxStatus.Pending:
      return Intent.Warning;
    case VegaTxStatus.Error:
      return Intent.Danger;
    default:
      return Intent.None;
  }
};

export const VegaTransactionDialog = ({
  orderDialogOpen,
  setOrderDialogOpen,
  finalizedOrder,
  transaction,
  reset,
  title = '',
  edit,
  editOrder,
}: VegaTransactionDialogProps) => {
  // open / close dialog
  useEffect(() => {
    if (transaction.status !== VegaTxStatus.Default || finalizedOrder) {
      setOrderDialogOpen(true);
    } else {
      setOrderDialogOpen(false);
    }
  }, [finalizedOrder, setOrderDialogOpen, transaction.status]);

  return (
    <Dialog
      open={orderDialogOpen}
      onChange={(isOpen) => {
        setOrderDialogOpen(isOpen);

        // If closing reset
        if (!isOpen) {
          reset();
        }
      }}
      intent={getDialogIntent(finalizedOrder, transaction)}
    >
      <VegaDialog
        key={`${title.toLowerCase().split(' ').join('-')}-tx-${
          transaction.txHash
        }`}
        transaction={transaction}
        finalizedOrder={finalizedOrder}
        title={title}
        edit={edit}
        editOrder={editOrder}
      />
    </Dialog>
  );
};

interface VegaDialogProps {
  transaction: VegaTxState;
  finalizedOrder: Order | null;
  title: string;
  edit?: (body?: unknown) => Promise<unknown>;
  editOrder?: Order | null;
}

interface VegaOrderEditDialogProps {
  title: string;
  order: Order | null;
  edit: (body?: unknown) => Promise<unknown>;
}

interface FormFields {
  entryPrice: string;
}

export const VegaOrderEditDialog = ({
  order,
  title,
  edit,
}: VegaOrderEditDialogProps) => {
  const headerClassName = 'text-h5 font-bold text-black dark:text-white';
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      entryPrice: order?.price
        ? addDecimalsFormatNumber(
            order?.price,
            order?.market?.decimalPlaces ?? 0
          )
        : '',
    },
  });
  if (!order) return null;
  return (
    <OrderDialogWrapper title={title} icon={<Icon name="hand-up" size={20} />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {order.market && (
          <div>
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${order.market.name}`)}</p>
          </div>
        )}
        {order.type === OrderType.Limit && order.market && (
          <div>
            <p className={headerClassName}>{t(`Last price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Amount remaining`)}</p>
          <p
            className={
              order.side === 'Buy'
                ? 'text-dark-green dark:text-vega-green'
                : 'text-red dark:text-vega-red'
            }
          >
            {order.side === 'Buy' ? '+' : '-'}
            {order.size}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
        <form
          onSubmit={handleSubmit(async (data) => {
            await edit({
              ...order,
              price: (
                Number(data.entryPrice) *
                Math.pow(10, order.market?.decimalPlaces ?? 0)
              ).toString(),
            });
          })}
          data-testid="edit-order"
        >
          <FormGroup label={t('Entry price')} labelFor="entryPrice">
            <Input
              {...register('entryPrice', { required: t('Required') })}
              id="entryPrice"
              type="text"
            />
            {errors.entryPrice?.message && (
              <InputError intent="danger" className="mt-4">
                {errors.entryPrice.message}
              </InputError>
            )}
          </FormGroup>
          <Button variant="primary" type="submit">
            {t('Update')}
          </Button>
        </form>
      </div>
    </OrderDialogWrapper>
  );
};

export const VegaDialog = ({
  transaction,
  finalizedOrder,
  title,
  edit,
  editOrder,
}: VegaDialogProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const headerClassName = 'text-h5 font-bold text-black dark:text-white';

  // Edit order
  if (edit && editOrder && transaction.status === VegaTxStatus.Default) {
    return <VegaOrderEditDialog title={title} order={editOrder} edit={edit} />;
  }

  // Rejected by wallet
  if (transaction.status === VegaTxStatus.Requested) {
    return (
      <OrderDialogWrapper
        title="Confirm transaction in wallet"
        icon={<Icon name="hand-up" size={20} />}
      >
        <p>
          {t(
            'Please open your wallet application and confirm or reject the transaction'
          )}
        </p>
      </OrderDialogWrapper>
    );
  }

  // Transaction error
  if (transaction.status === VegaTxStatus.Error) {
    return (
      <OrderDialogWrapper
        title="Order rejected by wallet"
        icon={<Icon name="warning-sign" size={20} />}
      >
        {transaction.error && (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {JSON.stringify(transaction.error, null, 2)}
          </pre>
        )}
      </OrderDialogWrapper>
    );
  }

  // Pending consensus
  if (!finalizedOrder) {
    return (
      <OrderDialogWrapper
        title="Awaiting network confirmation"
        icon={<Loader size="small" />}
      >
        {transaction.txHash && (
          <p className="break-all">
            {t('Waiting for few more blocks')} - &nbsp;
            <a
              className="underline"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </a>
          </p>
        )}
      </OrderDialogWrapper>
    );
  }

  // Order on network but was rejected
  if (finalizedOrder.status === 'Rejected') {
    return (
      <OrderDialogWrapper
        title="Order failed"
        icon={<Icon name="warning-sign" size={20} />}
      >
        <p data-testid="error-reason">
          {t(`Reason: ${finalizedOrder.rejectionReason}`)}
        </p>
      </OrderDialogWrapper>
    );
  }

  return (
    <OrderDialogWrapper title={title} icon={<Icon name="tick" size={20} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {finalizedOrder.market && (
          <div>
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${finalizedOrder.market.name}`)}</p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Status`)}</p>
          <p>{t(`${finalizedOrder.status}`)}</p>
        </div>
        {finalizedOrder.type === OrderType.Limit && finalizedOrder.market && (
          <div>
            <p className={headerClassName}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(
                finalizedOrder.price,
                finalizedOrder.market.decimalPlaces
              )}
            </p>
          </div>
        )}
        <div>
          <p className={headerClassName}>{t(`Amount`)}</p>
          <p
            className={
              finalizedOrder.side === 'Buy'
                ? 'text-vega-green'
                : 'text-vega-red'
            }
          >
            {`${finalizedOrder.side === 'Buy' ? '+' : '-'} ${
              finalizedOrder.size
            }
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
    </OrderDialogWrapper>
  );
};

interface OrderDialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const OrderDialogWrapper = ({
  children,
  icon,
  title,
}: OrderDialogWrapperProps) => {
  const headerClassName = 'text-h4 font-bold text-black dark:text-white';
  return (
    <div className="flex gap-12 max-w-full">
      <div className="pt-8 fill-current">{icon}</div>
      <div data-testid="order-wrapper" className="flex-1">
        <h1 data-testid="order-status-header" className={headerClassName}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};
