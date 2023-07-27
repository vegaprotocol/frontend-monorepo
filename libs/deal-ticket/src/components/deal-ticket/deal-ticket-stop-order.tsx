import type { FormEventHandler } from 'react';
import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { StopOrdersSubmission } from '@vegaprotocol/wallet';
import {
  formatNumber,
  removeDecimal,
  toDecimal,
  validateAmount,
} from '@vegaprotocol/utils';
import { useForm, Controller } from 'react-hook-form';
import * as Schema from '@vegaprotocol/types';
import {
  Radio,
  RadioGroup,
  Input,
  Checkbox,
  FormGroup,
  InputError,
  Select,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { getDerivedPrice, type Market } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { timeInForceLabel, useOrder } from '@vegaprotocol/orders';
import {
  NoWalletWarning,
  REDUCE_ONLY_TOOLTIP,
  useNotionalSize,
} from './deal-ticket';
import { TypeToggle } from './type-selector';
import {
  useStopOrderFormValues,
  type StopOrderFormValues,
} from '../../hooks/use-stop-order-form-values';
import {
  DealTicketType,
  useDealTicketTypeStore,
} from '../../hooks/use-type-store';
import { mapFormValuesToStopOrdersSubmission } from '../../utils/map-form-values-to-stop-order-submission';
import { DealTicketButton } from './deal-ticket-button';
import noop from 'lodash/noop';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { validateExpiration } from '../../utils';

export interface StopOrderProps {
  market: Market;
  marketPrice?: string | null;
  submit: (order: StopOrdersSubmission) => void;
}

const defaultValues: Partial<StopOrderFormValues> = {
  type: Schema.OrderType.TYPE_LIMIT,
  side: Schema.Side.SIDE_BUY,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  triggerType: 'price',
  triggerDirection:
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
  expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT,
  size: '0',
};

const stopSubmit: FormEventHandler = (e) => e.preventDefault();

export const StopOrder = ({ market, marketPrice, submit }: StopOrderProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const setDealTicketType = useDealTicketTypeStore((state) => state.set);
  const [, updateOrder] = useOrder(market.id);
  const updateStoredFormValues = useStopOrderFormValues(
    (state) => state.update
  );
  const storedFormValues = useStopOrderFormValues(
    (state) => state.formValues[market.id]
  );
  const { clearErrors, handleSubmit, setValue, watch, control, formState } =
    useForm<StopOrderFormValues>({
      defaultValues: { ...defaultValues, ...storedFormValues },
    });
  const { errors } = formState;
  const lastSubmitTime = useRef(0);
  const onSubmit = useCallback(
    (data: StopOrderFormValues) => {
      const now = new Date().getTime();
      if (lastSubmitTime.current && now - lastSubmitTime.current < 1000) {
        return;
      }
      submit(
        mapFormValuesToStopOrdersSubmission(
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
  const triggerType = watch('triggerType');
  const triggerPrice = watch('triggerPrice');
  const timeInForce = watch('timeInForce');
  const type = watch('type');
  const rawPrice = watch('price');
  const rawSize = watch('size');

  const isPriceTrigger = triggerType === 'price';
  const size = removeDecimal(rawSize, market.positionDecimalPlaces);
  const price = useMemo(() => {
    return (
      marketPrice &&
      getDerivedPrice(
        {
          type,
          price: rawPrice && removeDecimal(rawPrice, market.decimalPlaces),
        },
        type === Schema.OrderType.TYPE_MARKET && isPriceTrigger && triggerPrice
          ? removeDecimal(triggerPrice, market.decimalPlaces)
          : marketPrice
      )
    );
  }, [
    market.decimalPlaces,
    marketPrice,
    rawPrice,
    isPriceTrigger,
    triggerPrice,
    type,
  ]);

  const notionalSize = useNotionalSize(
    price,
    size,
    market.decimalPlaces,
    market.positionDecimalPlaces
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      updateStoredFormValues(market.id, value);
    });
    return () => subscription.unsubscribe();
  }, [watch, market.id, updateStoredFormValues]);

  const { quoteName, settlementAsset: asset } =
    market.tradableInstrument.instrument.product;

  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const priceStep = toDecimal(market?.decimalPlaces);
  const trailingPercentOffsetStep = '0.1';

  const priceFormatted =
    isPriceTrigger && triggerPrice
      ? formatNumber(triggerPrice, market.decimalPlaces)
      : undefined;

  return (
    <form
      onSubmit={isReadOnly || !pubKey ? stopSubmit : handleSubmit(onSubmit)}
      noValidate
    >
      <FormGroup label={t('Order type')} labelFor="order-type" compact={true}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => {
            const { value } = field;
            return (
              <TypeToggle
                value={
                  value === Schema.OrderType.TYPE_LIMIT
                    ? DealTicketType.StopLimit
                    : DealTicketType.StopMarket
                }
                onChange={(value) => {
                  const type = value as DealTicketType;
                  setDealTicketType(market.id, type);
                  if (
                    type === DealTicketType.Limit ||
                    type === DealTicketType.Market
                  ) {
                    updateOrder({
                      type:
                        type === DealTicketType.Limit
                          ? Schema.OrderType.TYPE_LIMIT
                          : Schema.OrderType.TYPE_MARKET,
                    });
                    return;
                  }
                  if (type === DealTicketType.StopMarket) {
                    clearErrors('price');
                  }
                  setValue(
                    'type',
                    type === DealTicketType.StopLimit
                      ? Schema.OrderType.TYPE_LIMIT
                      : Schema.OrderType.TYPE_MARKET
                  );
                }}
              />
            );
          }}
        />
        {errors.type && (
          <InputError testId="stop-order-error-message-type">
            {errors.type.message}
          </InputError>
        )}
      </FormGroup>
      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onSelect={field.onChange} />
        )}
      />
      <div className="mb-2">
        <div className="flex items-start gap-4">
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Size`)}
            className="!mb-0 flex-1"
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
          <div className="pt-7 leading-10">@</div>
          <div className="flex-1">
            {type === Schema.OrderType.TYPE_LIMIT ? (
              <FormGroup
                labelFor="input-price-quote"
                label={t(`Price (${quoteName})`)}
                labelAlign="right"
                className="!mb-0"
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
              <div
                className="text-sm text-right pt-7 leading-10"
                data-testid="price"
              >
                {priceFormatted && quoteName
                  ? `~${priceFormatted} ${quoteName}`
                  : '-'}
              </div>
            )}
          </div>
        </div>
        {errors.size && (
          <InputError testId="deal-ticket-error-message-size-limit">
            {errors.size.message}
          </InputError>
        )}

        {errors.price && (
          <InputError testId="deal-ticket-error-message-price-limit">
            {errors.price.message}
          </InputError>
        )}
      </div>
      <div className="mb-2">
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
                {...field}
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
        </FormGroup>
        {errors.timeInForce && (
          <InputError testId="stop-error-message-tif">
            {errors.timeInForce.message}
          </InputError>
        )}
      </div>
      <div className="flex gap-2 pb-2 justify-end">
        <Checkbox
          name="reduce-only"
          checked={true}
          disabled={true}
          label={
            <Tooltip description={<span>{t(REDUCE_ONLY_TOOLTIP)}</span>}>
              <span className="text-xs">{t('Reduce only')}</span>
            </Tooltip>
          }
        />
      </div>
      <FormGroup label={t('Trigger')} compact={true} labelFor="">
        <Controller
          name="triggerDirection"
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <RadioGroup
                name="triggerDirection"
                onChange={onChange}
                value={value}
                orientation="horizontal"
                className="mb-2"
              >
                <Radio
                  value={
                    Schema.StopOrderTriggerDirection
                      .TRIGGER_DIRECTION_RISES_ABOVE
                  }
                  id="triggerDirection-risesAbove"
                  label={'Rises above'}
                />
                <Radio
                  value={
                    Schema.StopOrderTriggerDirection
                      .TRIGGER_DIRECTION_FALLS_BELOW
                  }
                  id="triggerDirection-fallsBelow"
                  label={'Falls below'}
                />
              </RadioGroup>
            );
          }}
        />
        {isPriceTrigger && (
          <div className="mb-2">
            <Controller
              name="triggerPrice"
              rules={{
                required: t('You need provide a price'),
                min: {
                  value: priceStep,
                  message: t('Price cannot be lower than ' + priceStep),
                },
                validate: validateAmount(priceStep, 'Price'),
              }}
              control={control}
              render={({ field }) => {
                return (
                  <div className="mb-2">
                    <Input
                      data-testid="triggerPrice"
                      type="number"
                      appendElement={asset.symbol}
                      {...field}
                    />
                  </div>
                );
              }}
            />
            {errors.triggerPrice && (
              <InputError testId="stop-order-error-message-trigger-price">
                {errors.triggerPrice.message}
              </InputError>
            )}
          </div>
        )}
        {!isPriceTrigger && (
          <div className="mb-2">
            <Controller
              name="triggerTrailingPercentOffset"
              control={control}
              rules={{
                required: t('You need provide a trailing percent offset'),
                min: {
                  value: trailingPercentOffsetStep,
                  message: t(
                    'Trailing percent offset cannot be lower than ' +
                      trailingPercentOffsetStep
                  ),
                },
                max: {
                  value: '99.9',
                  message: t(
                    'Trailing percent offset cannot be higher than 99.9'
                  ),
                },
                validate: validateAmount(
                  trailingPercentOffsetStep,
                  'Trailing percentage offset'
                ),
              }}
              render={({ field }) => {
                return (
                  <div className="mb-2">
                    <Input
                      type="number"
                      step={trailingPercentOffsetStep}
                      appendElement="%"
                      {...field}
                    />
                  </div>
                );
              }}
            />
            {errors.triggerTrailingPercentOffset && (
              <InputError testId="stop-order-error-message-trigger-trailing-percent-offset">
                {errors.triggerTrailingPercentOffset.message}
              </InputError>
            )}
          </div>
        )}
        <Controller
          name="triggerType"
          control={control}
          rules={{ deps: ['triggerTrailingPercentOffset', 'triggerPrice'] }}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <RadioGroup
                onChange={onChange}
                value={value}
                orientation="horizontal"
              >
                <Radio value="price" id="triggerType-price" label={'Price'} />
                <Radio
                  value="trailingPercentOffset"
                  id="triggerType-trailingPercentOffset"
                  label={'Trailing Percent Offset'}
                />
              </RadioGroup>
            );
          }}
        />
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
            labelFor="expiryStrategy"
            compact={true}
          >
            <Controller
              name="expiryStrategy"
              control={control}
              render={({ field }) => {
                return (
                  <RadioGroup orientation="horizontal" {...field}>
                    <Radio
                      value={
                        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT
                      }
                      id="expiryStrategy-submit"
                      label={'Submit'}
                    />
                    <Radio
                      value={
                        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS
                      }
                      id="expiryStrategy-cancel"
                      label={'Cancel'}
                    />
                  </RadioGroup>
                );
              }}
            />
          </FormGroup>
          <div className="mb-2">
            <Controller
              name="expiresAt"
              control={control}
              rules={{
                validate: validateExpiration,
              }}
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
          </div>
        </>
      )}
      <NoWalletWarning pubKey={pubKey} isReadOnly={isReadOnly} asset={asset} />
      <DealTicketButton side={side} label={t('Submit Stop Order')} />
      <DealTicketFeeDetails
        order={{
          marketId: market.id,
          price: price || undefined,
          side,
          size,
          timeInForce,
          type,
        }}
        notionalSize={notionalSize}
        assetSymbol={asset.symbol}
        market={market}
      />
    </form>
  );
};
