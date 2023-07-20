import { useRef, useCallback } from 'react';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import type {
  StopOrderSetup,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toDecimal,
  toNanoSeconds,
  validateAmount,
} from '@vegaprotocol/utils';
import type { Control } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import * as Schema from '@vegaprotocol/types';
import type { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';
import {
  Button,
  Radio,
  RadioGroup,
  Input,
  Checkbox,
  AsyncRenderer,
  Splash,
  FormGroup,
  Toggle,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/markets';
import { marketDataProvider, useMarket } from '@vegaprotocol/markets';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { t } from '@vegaprotocol/i18n';
import { normalizeOrderSubmission } from '@vegaprotocol/wallet';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { timeInForceLabel } from '@vegaprotocol/orders';

export interface StopOrderFormValues {
  side: Side;

  direction: 'fallsBelow' | 'risesAbove';

  trigger: 'price' | 'trailingPercentOffset';
  triggerPrice: string;
  triggerTrailingPercentOffset: string;

  type: OrderType;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;

  expire: boolean;
  expiryStrategy?: 'submit' | 'cancel';
  expiresAt?: string;
}

export const mapInputToStopOrdersSubmission = (
  data: StopOrderFormValues,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {};
  const stopOrderSetup: StopOrderSetup = {
    orderSubmission: normalizeOrderSubmission(
      {
        marketId,
        type: data.type,
        side: data.side,
        size: data.size,
        timeInForce: data.timeInForce,
        price: data.price,
        reduceOnly: true,
      },
      decimalPlaces,
      positionDecimalPlaces
    ),
  };
  if (data.trigger === 'price') {
    stopOrderSetup.price = data.triggerPrice;
  } else if (data.trigger === 'trailingPercentOffset') {
    stopOrderSetup.trailingPercentOffset = (
      Number(data.triggerTrailingPercentOffset) / 100
    ).toString();
  }

  if (data.expire) {
    stopOrderSetup.expiresAt = data.expiresAt && toNanoSeconds(data.expiresAt);
    if (data.expiryStrategy === 'cancel') {
      stopOrderSetup.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
    } else if (data.expiryStrategy === 'submit') {
      stopOrderSetup.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT;
    }
  }

  if (data.direction === 'risesAbove') {
    submission.risesAbove = stopOrderSetup;
  }
  if (data.direction === 'fallsBelow') {
    submission.fallsBelow = stopOrderSetup;
  }

  return submission;
};

export const StopOrderContainer = ({ marketId }: { marketId: string }) => {
  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useMarket(marketId);

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
    reload,
  } = useThrottledDataProvider(
    {
      dataProvider: marketDataProvider,
      variables: { marketId },
    },
    1000
  );
  const create = useVegaTransactionStore((state) => state.create);
  return (
    <AsyncRenderer
      data={market && marketData}
      loading={marketLoading || marketDataLoading}
      error={marketError || marketDataError}
      reload={reload}
    >
      {market && marketData ? (
        <StopOrder
          market={market}
          submit={(stopOrdersSubmission) => create({ stopOrdersSubmission })}
        />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};

export interface StopOrderProps {
  market: Market;
  submit: (order: StopOrdersSubmission) => void;
}

const toggles = [
  { label: t('Limit'), value: Schema.OrderType.TYPE_LIMIT },
  { label: t('Market'), value: Schema.OrderType.TYPE_MARKET },
];

export const StopOrder = ({ market, submit }: StopOrderProps) => {
  const {
    // register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<StopOrderFormValues>({
    defaultValues: {
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_SELL,
      trigger: 'price',
      direction: 'risesAbove',
    },
  });
  const lastSubmitTime = useRef(0);
  const onSubmit = useCallback(
    (data: StopOrderFormValues) => {
      const now = new Date().getTime();
      if (lastSubmitTime.current && now - lastSubmitTime.current < 1000) {
        return;
      }
      submit(
        mapInputToStopOrdersSubmission(
          data,
          market.id,
          market.decimalPlaces,
          market.positionDecimalPlaces
        )
      );
      lastSubmitTime.current = now;
    },
    [market.id, market.decimalPlaces, market.positionDecimalPlaces, submit]
  );
  const side = watch('side');
  const expire = watch('expire');
  const trigger = watch('trigger');
  const triggerPrice = watch('triggerPrice');
  const type = watch('type');
  const assetSymbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;
  const { quoteName } = market.tradableInstrument.instrument.product;

  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const priceStep = toDecimal(market?.decimalPlaces);

  const priceFormatted =
    trigger === 'price' && triggerPrice
      ? formatNumber(triggerPrice, market.decimalPlaces)
      : undefined;

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <FormGroup label={t('Order type')} labelFor="order-type" compact={true}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Toggle
              id="order-type"
              name="order-type"
              toggles={toggles}
              checkedValue={field.value}
              onChange={(e) =>
                field.onChange(e.target.value as Schema.OrderType)
              }
            />
          )}
        />
        {/*errorMessage && (
          <InputError testId="deal-ticket-error-message-type">
            {renderError(errorMessage as MarketModeValidationType)}
          </InputError>
        )*/}
      </FormGroup>
      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onSelect={field.onChange} />
        )}
      />
      <FormGroup label={t('Trigger')} compact={true} labelFor="">
        <Controller
          name="direction"
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <RadioGroup
                onChange={onChange}
                value={value}
                orientation="horizontal"
                className="mb-2"
              >
                <Radio
                  value="risesAbove"
                  id="triggerRisesAbove"
                  label={'Rises above'}
                />
                <Radio
                  value="fallsBelow"
                  id="triggerFallsBelow"
                  label={'Falls above'}
                />
              </RadioGroup>
            );
          }}
        />
        {trigger === 'price' && (
          <Controller
            name="triggerPrice"
            control={control}
            render={({ field }) => {
              const { onChange, value } = field;
              return (
                <div className="mb-2">
                  <Input
                    type="number"
                    onChange={onChange}
                    value={value || ''}
                    appendElement={assetSymbol}
                  />
                </div>
              );
            }}
          />
        )}
        {trigger === 'trailingPercentOffset' && (
          <Controller
            name="triggerTrailingPercentOffset"
            control={control}
            render={({ field }) => {
              const { onChange, value } = field;
              return (
                <div className="mb-2">
                  <Input
                    type="number"
                    onChange={onChange}
                    value={value || ''}
                    appendElement="%"
                  />
                </div>
              );
            }}
          />
        )}
        <Controller
          name="trigger"
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <RadioGroup
                onChange={onChange}
                value={value}
                orientation="horizontal"
              >
                <Radio
                  value="price"
                  id={`${side}TriggerPrice`}
                  label={'Price'}
                />
                <Radio
                  value="trailingPercentOffset"
                  id={`${side}TriggerTrailingPercentOffset`}
                  label={'Trailing Percent Offset'}
                />
              </RadioGroup>
            );
          }}
        />
      </FormGroup>
      <div className="mb-2">
        <div className="flex items-center gap-4">
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Size`)}
            className="!mb-1 flex-1"
          >
            <Controller
              name="size"
              control={control}
              rules={{
                required: t('You need to provide a size'),
                min: {
                  value: sizeStep,
                  message: t('Size cannot be lower than ' + sizeStep),
                },
                validate: validateAmount(sizeStep, 'Size'),
              }}
              render={({ field }) => (
                <Input
                  id="input-order-size-market"
                  className="w-full"
                  type="number"
                  step={sizeStep}
                  min={sizeStep}
                  onWheel={(e) => e.currentTarget.blur()}
                  data-testid="order-size"
                  {...field}
                />
              )}
            />
          </FormGroup>
          <div className="pt-5">@</div>
          <div className="flex-1">
            {type === OrderType.TYPE_LIMIT ? (
              <FormGroup
                labelFor="input-price-quote"
                label={t(`Price (${quoteName})`)}
                labelAlign="right"
                className="!mb-1"
              >
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    required: t('You need provide a price'),
                    min: {
                      value: priceStep,
                      message: t('Price cannot be lower than ' + priceStep),
                    },
                    validate: validateAmount(priceStep, 'Price'),
                  }}
                  render={({ field }) => (
                    <Input
                      id="input-price-quote"
                      className="w-full"
                      type="number"
                      step={priceStep}
                      data-testid="order-price"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...field}
                    />
                  )}
                />
              </FormGroup>
            ) : (
              <div className="text-sm text-right pt-5" data-testid="price">
                {priceFormatted && quoteName
                  ? `~${priceFormatted} ${quoteName}`
                  : '-'}
              </div>
            )}
          </div>
        </div>
        {/*sizeError && (
          <InputError testId="deal-ticket-error-message-size-limit">
            {sizeError}
          </InputError>
        )}

        {priceError && (
          <InputError testId="deal-ticket-error-message-price-limit">
            {priceError}
          </InputError>
        )*/}
      </div>
      <FormGroup
        label={t('Time in force')}
        labelFor="select-time-in-force"
        compact={true}
      >
        <Controller
          name="timeInForce"
          control={control}
          render={({ field }) => (
            <Select
              id="select-time-in-force"
              className="w-full"
              data-testid="order-tif"
            >
              <option
                key={Schema.OrderTimeInForce.TIME_IN_FORCE_IOC}
                value={Schema.OrderTimeInForce.TIME_IN_FORCE_IOC}
              >
                {timeInForceLabel(Schema.OrderTimeInForce.TIME_IN_FORCE_IOC)}
              </option>
              <option
                key={Schema.OrderTimeInForce.TIME_IN_FORCE_FOK}
                value={Schema.OrderTimeInForce.TIME_IN_FORCE_FOK}
              >
                {timeInForceLabel(Schema.OrderTimeInForce.TIME_IN_FORCE_FOK)}
              </option>
            </Select>
          )}
        />
        {/*errorMessage && (
          <InputError testId="deal-ticket-error-message-tif">
            {renderError(errorMessage)}
          </InputError>
        )*/}
      </FormGroup>
      <div className="mb-2">
        <Controller
          name="expire"
          control={control}
          render={({ field }) => {
            const { onChange: onCheckedChange, value } = field;
            return (
              <Checkbox
                onCheckedChange={onCheckedChange}
                checked={value}
                name="expire"
                label={'Expire'}
              />
            );
          }}
        />
      </div>
      {expire && (
        <>
          <FormGroup
            label={t('Strategy')}
            labelFor="expiry-strategy"
            compact={true}
          >
            <Controller
              name="expiryStrategy"
              control={control}
              render={({ field }) => {
                const { onChange, value } = field;
                return (
                  <RadioGroup
                    onChange={onChange}
                    value={value}
                    orientation="horizontal"
                  >
                    <Radio
                      value="submit"
                      id="expiryStrategySubmit"
                      label={'Submit'}
                    />
                    <Radio
                      value="cancel"
                      id="expiryStrategyCancel"
                      label={'Cancel'}
                    />
                  </RadioGroup>
                );
              }}
            />
          </FormGroup>
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => {
              const { value, onChange: onSelect } = field;
              return (
                <ExpirySelector
                  value={value}
                  onSelect={onSelect}
                  errorMessage={errors.expiresAt?.message}
                />
              );
            }}
          />
        </>
      )}
      <Button
        variant={side === Schema.Side.SIDE_BUY ? 'ternary' : 'secondary'}
        fill
        type="submit"
        data-testid="place-order"
      >
        {t('Submit Stop Order')}
      </Button>
    </form>
  );
};
