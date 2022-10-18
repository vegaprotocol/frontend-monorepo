import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  t,
  addDecimalsFormatNumber,
  removeDecimal,
} from '@vegaprotocol/react-helpers';
import { Button, InputError, Link } from '@vegaprotocol/ui-toolkit';
import { TypeSelector } from './type-selector';
import { SideSelector } from './side-selector';
import { DealTicketAmount } from './deal-ticket-amount';
import { TimeInForceSelector } from './time-in-force-selector';
import type { DealTicketMarketFragment } from './__generated___/DealTicket';
import { ExpirySelector } from './expiry-selector';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  useVegaWallet,
  useVegaWalletDialogStore,
  VEGA_WALLET_RELEASE_URL,
} from '@vegaprotocol/wallet';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import { getDefaultOrder } from '../deal-ticket-validation';
import {
  isMarketInAuction,
  useOrderValidation,
} from '../deal-ticket-validation/use-order-validation';

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: DealTicketMarketFragment;
  submit: (order: OrderSubmissionBody['orderSubmission']) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: OrderSubmissionBody['orderSubmission'];
}

export const DealTicket = ({
  market,
  submit,
  transactionStatus,
}: DealTicketProps) => {
  const { pubKey } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<OrderSubmissionBody['orderSubmission']>({
    mode: 'onChange',
    defaultValues: getDefaultOrder(market),
  });

  const orderType = watch('type');
  const orderTimeInForce = watch('timeInForce');
  const { message, isDisabled: disabled } = useOrderValidation({
    market,
    orderType,
    orderTimeInForce,
    fieldErrors: errors,
  });
  const isDisabled = transactionStatus === 'pending' || disabled;

  const onSubmit = useCallback(
    (order: OrderSubmissionBody['orderSubmission']) => {
      if (!isDisabled) {
        submit({
          ...order,
          price:
            order.price && removeDecimal(order.price, market.decimalPlaces),
          size: removeDecimal(order.size, market.positionDecimalPlaces),
          expiresAt:
            order.timeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT
              ? order.expiresAt
              : undefined,
        });
      }
    },
    [isDisabled, submit, market.decimalPlaces, market.positionDecimalPlaces]
  );

  const getPrice = () => {
    if (isMarketInAuction(market)) {
      //  0 can never be a valid uncrossing price as it would require there being orders on the book at that price.
      if (
        market.data?.indicativePrice &&
        BigInt(market.data?.indicativePrice) !== BigInt(0)
      ) {
        return market.data.indicativePrice;
      }
      return '-';
    }
    return market.depth.lastTrade?.price;
  };
  const price = getPrice();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4" noValidate>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <TypeSelector
            value={field.value}
            onSelect={(type) => {
              if (type === OrderType.TYPE_LIMIT) {
                setValue('timeInForce', OrderTimeInForce.TIME_IN_FORCE_GTC);
              } else {
                setValue('timeInForce', OrderTimeInForce.TIME_IN_FORCE_IOC);
              }
              field.onChange(type);
            }}
          />
        )}
      />
      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onSelect={field.onChange} />
        )}
      />
      <DealTicketAmount
        orderType={orderType}
        market={market}
        register={register}
        price={
          price
            ? addDecimalsFormatNumber(price, market.decimalPlaces)
            : undefined
        }
        quoteName={market.tradableInstrument.instrument.product.quoteName}
      />
      <Controller
        name="timeInForce"
        control={control}
        render={({ field }) => (
          <TimeInForceSelector
            value={field.value}
            orderType={orderType}
            onSelect={field.onChange}
          />
        )}
      />
      {orderType === OrderType.TYPE_LIMIT &&
        orderTimeInForce === OrderTimeInForce.TIME_IN_FORCE_GTT && (
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <ExpirySelector value={field.value} onSelect={field.onChange} />
            )}
          />
        )}
      {pubKey ? (
        <>
          <Button
            variant="primary"
            fill={true}
            type="submit"
            disabled={isDisabled}
            data-testid="place-order"
          >
            {transactionStatus === 'pending'
              ? t('Pending...')
              : t('Place order')}
          </Button>
          {message && (
            <InputError
              intent={isDisabled ? 'danger' : 'warning'}
              data-testid="dealticket-error-message"
            >
              {message}
            </InputError>
          )}
        </>
      ) : (
        <>
          <Button
            variant="default"
            fill
            type="button"
            data-testid="order-connect-wallet"
            onClick={openVegaWalletDialog}
            className="!text-sm !px-1 !py-1"
          >
            {t('Connect your Vega wallet to trade')}
          </Button>
          <Link
            className="block w-full text-center mt-2 text-neutral-500 dark:text-neutral-400"
            href={VEGA_WALLET_RELEASE_URL}
          >
            {t('Get a Vega Wallet')}
          </Link>
        </>
      )}
    </form>
  );
};
