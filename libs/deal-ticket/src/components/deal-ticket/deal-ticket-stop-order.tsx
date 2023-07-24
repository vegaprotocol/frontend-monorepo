import { useRef, useCallback, useEffect } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { StopOrdersSubmission } from '@vegaprotocol/wallet';
import { formatNumber, toDecimal, validateAmount } from '@vegaprotocol/utils';
import { useForm, Controller } from 'react-hook-form';
import * as Schema from '@vegaprotocol/types';
import {
  Button,
  Radio,
  RadioGroup,
  Input,
  Checkbox,
  FormGroup,
  InputError,
  Select,
} from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { timeInForceLabel, useOrder } from '@vegaprotocol/orders';
import { NoWalletWarning } from './deal-ticket';
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

export interface StopOrderProps {
  market: Market;
  submit: (order: StopOrdersSubmission) => void;
}

const defaultValues: Partial<StopOrderFormValues> = {
  type: Schema.OrderType.TYPE_MARKET,
  side: Schema.Side.SIDE_SELL,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  trigger: 'price',
  direction: 'risesAbove',
  expiryStrategy: 'submit',
};

export const StopOrder = ({ market, submit }: StopOrderProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const setDealTicketType = useDealTicketTypeStore((state) => state.set);
  const [, updateOrder] = useOrder(market.id);
  const updateStoredFormValues = useStopOrderFormValues(
    (state) => state.update
  );
  const storedFormValues = useStopOrderFormValues(
    (state) => state.formValues[market.id]
  );
  const {
    // register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState,
  } = useForm<StopOrderFormValues>({
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
  const trigger = watch('trigger');
  const triggerPrice = watch('triggerPrice');
  const type = watch('type');

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
    trigger === 'price' && triggerPrice
      ? formatNumber(triggerPrice, market.decimalPlaces)
      : undefined;

  return (
    <form
      onSubmit={isReadOnly || !pubKey ? undefined : handleSubmit(onSubmit)}
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
                onChange={(e) => {
                  const type = e.target.value as DealTicketType;
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
        <div className="flex items-center gap-4">
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
              <div className="text-sm text-right pt-5" data-testid="price">
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
        {trigger === 'trailingPercentOffset' && (
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
          name="trigger"
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
                return (
                  <RadioGroup orientation="horizontal" {...field}>
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
          <div className="mb-2">
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
            {errors.expiresAt && (
              <InputError testId="stop-error-message-expiresAt">
                {errors.expiresAt.message}
              </InputError>
            )}
          </div>
        </>
      )}
      <NoWalletWarning pubKey={pubKey} isReadOnly={isReadOnly} asset={asset} />
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
