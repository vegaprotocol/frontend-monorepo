import { useRef, useCallback, useEffect } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { StopOrdersSubmission } from '@vegaprotocol/wallet';
import { removeDecimal, toDecimal, validateAmount } from '@vegaprotocol/utils';
import type { Control, UseFormWatch } from 'react-hook-form';
import { useForm, Controller, useController } from 'react-hook-form';
import * as Schema from '@vegaprotocol/types';
import {
  TradingRadio as Radio,
  TradingRadioGroup as RadioGroup,
  TradingInput as Input,
  TradingCheckbox as Checkbox,
  TradingFormGroup as FormGroup,
  TradingInputError as InputError,
  TradingSelect as Select,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { getDerivedPrice, type Market } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { timeInForceLabel } from '@vegaprotocol/orders';
import {
  NoWalletWarning,
  REDUCE_ONLY_TOOLTIP,
  stopSubmit,
  getNotionalSize,
} from './deal-ticket';
import { TypeToggle } from './type-selector';
import {
  useDealTicketFormValues,
  DealTicketType,
  type StopOrderFormValues,
  dealTicketTypeToOrderType,
  isStopOrderType,
} from '../../hooks/use-form-values';
import { mapFormValuesToStopOrdersSubmission } from '../../utils/map-form-values-to-submission';
import { DealTicketButton } from './deal-ticket-button';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { validateExpiration } from '../../utils';

export interface StopOrderProps {
  market: Market;
  marketPrice?: string | null;
  submit: (order: StopOrdersSubmission) => void;
}

const trailingPercentOffsetStep = '0.1';

const getDefaultValues = (
  type: Schema.OrderType,
  storedValues?: Partial<StopOrderFormValues>
): StopOrderFormValues => ({
  type,
  side: Schema.Side.SIDE_BUY,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  triggerType: 'price',
  triggerDirection:
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
  expire: false,
  expiryStrategy: 'submit',
  size: '0',
  ocoType: type,
  ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  ocoTriggerType: 'price',
  ocoSize: '0',
  ...storedValues,
});

const Trigger = ({
  control,
  watch,
  priceStep,
  assetSymbol,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  watch: UseFormWatch<StopOrderFormValues>;
  priceStep: string;
  assetSymbol: string;
  oco?: boolean;
}) => {
  const triggerType = watch(oco ? 'ocoTriggerType' : 'triggerType');
  const isPriceTrigger = triggerType === 'price';
  return (
    <FormGroup label={t('Trigger')} labelFor="">
      <Controller
        name="triggerDirection"
        control={control}
        render={({ field }) => {
          const { value, onChange } = field;
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
                  oco
                    ? Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_FALLS_BELOW
                    : Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_RISES_ABOVE
                }
                id={
                  oco
                    ? 'ocoTriggerDirection-risesAbove'
                    : 'triggerDirection-risesAbove'
                }
                label={'Rises above'}
              />
              <Radio
                value={
                  !oco
                    ? Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_FALLS_BELOW
                    : Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_RISES_ABOVE
                }
                id={
                  oco
                    ? 'ocoTriggerDirection-fallsBelow'
                    : 'triggerDirection-fallsBelow'
                }
                label={'Falls below'}
              />
            </RadioGroup>
          );
        }}
      />
      {isPriceTrigger && (
        <div className="mb-2">
          <Controller
            name={oco ? 'ocoTriggerPrice' : 'triggerPrice'}
            rules={{
              required: t('You need provide a price'),
              min: {
                value: priceStep,
                message: t('Price cannot be lower than ' + priceStep),
              },
              validate: validateAmount(priceStep, 'Price'),
            }}
            control={control}
            render={({ field, fieldState }) => {
              const { value, ...props } = field;
              return (
                <>
                  <div className="mb-2">
                    <Input
                      data-testid={oco ? 'ocoTriggerPrice' : 'triggerPrice'}
                      type="number"
                      step={priceStep}
                      appendElement={assetSymbol}
                      value={value || ''}
                      hasError={!!fieldState.error}
                      {...props}
                    />
                  </div>
                  {fieldState.error && (
                    <InputError
                      testId={
                        oco
                          ? 'stop-order-error-message-oco-trigger-price'
                          : 'stop-order-error-message-trigger-price'
                      }
                    >
                      {fieldState.error.message}
                    </InputError>
                  )}
                </>
              );
            }}
          />
        </div>
      )}
      {!isPriceTrigger && (
        <div className="mb-2">
          <Controller
            name={
              oco
                ? 'ocoTriggerTrailingPercentOffset'
                : 'triggerTrailingPercentOffset'
            }
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
            render={({ field, fieldState }) => {
              const { value, ...props } = field;
              return (
                <>
                  <div className="mb-2">
                    <Input
                      type="number"
                      step={trailingPercentOffsetStep}
                      appendElement="%"
                      data-testid={
                        oco
                          ? 'ocoTriggerTrailingPercentOffset'
                          : 'triggerTrailingPercentOffset'
                      }
                      value={value || ''}
                      hasError={!!fieldState.error}
                      {...props}
                    />
                  </div>
                  {fieldState.error && (
                    <InputError
                      testId={
                        oco
                          ? 'stop-order-error-message-trigger-oco-trailing-percent-offset'
                          : 'stop-order-error-message-trigger-trailing-percent-offset'
                      }
                    >
                      {fieldState.error.message}
                    </InputError>
                  )}
                </>
              );
            }}
          />
        </div>
      )}
      <Controller
        name={oco ? 'ocoTriggerType' : 'triggerType'}
        control={control}
        rules={{
          deps: oco
            ? ['ocoTriggerTrailingPercentOffset', 'ocoTriggerPrice']
            : ['triggerTrailingPercentOffset', 'triggerPrice'],
        }}
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
                id={oco ? 'ocoTriggerType-price' : 'triggerType-price'}
                label={'Price'}
              />
              <Radio
                value="trailingPercentOffset"
                id={
                  oco
                    ? 'ocoTriggerType-trailingPercentOffset'
                    : 'triggerType-trailingPercentOffset'
                }
                label={'Trailing Percent Offset'}
              />
            </RadioGroup>
          );
        }}
      />
    </FormGroup>
  );
};

const Size = ({
  control,
  sizeStep,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  sizeStep: string;
  oco?: boolean;
}) => {
  return (
    <Controller
      name={oco ? 'ocoSize' : 'size'}
      control={control}
      rules={{
        required: t('You need to provide a size'),
        min: {
          value: sizeStep,
          message: t('Size cannot be lower than ' + sizeStep),
        },
        validate: validateAmount(sizeStep, 'Size'),
      }}
      render={({ field, fieldState }) => {
        const { value, ...props } = field;
        return (
          <div className="mb-4">
            <FormGroup labelFor="input-price-quote" label={t(`Size`)} compact>
              <Input
                id={oco ? 'oco-order-size' : 'order-size'}
                className="w-full"
                type="number"
                step={sizeStep}
                min={sizeStep}
                onWheel={(e) => e.currentTarget.blur()}
                data-testid={oco ? 'oco-order-size' : 'order-size'}
                value={value || ''}
                hasError={!!fieldState.error}
                {...props}
              />
            </FormGroup>
            {fieldState.error && (
              <InputError
                testId={
                  oco
                    ? 'stop-order-error-message-oco-size'
                    : 'stop-order-error-message-size'
                }
              >
                {fieldState.error.message}
              </InputError>
            )}
          </div>
        );
      }}
    />
  );
};

const Price = ({
  control,
  watch,
  priceStep,
  quoteName,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  watch: UseFormWatch<StopOrderFormValues>;
  priceStep: string;
  quoteName: string;
  oco?: boolean;
}) => {
  if (watch(oco ? 'ocoType' : 'type') === Schema.OrderType.TYPE_MARKET) {
    return null;
  }
  return (
    <Controller
      name={oco ? 'ocoPrice' : 'price'}
      control={control}
      rules={{
        deps: 'type',
        required: t('You need provide a price'),
        min: {
          value: priceStep,
          message: t('Price cannot be lower than ' + priceStep),
        },
        validate: validateAmount(priceStep, 'Price'),
      }}
      render={({ field, fieldState }) => {
        const { value, ...props } = field;
        return (
          <div className="mb-4">
            <FormGroup
              labelFor={oco ? 'input-ocoPrice-quote' : 'input-price-quote'}
              label={t(`Price (${quoteName})`)}
              compact={true}
            >
              <Input
                id={oco ? 'input-ocoPrice-quote' : 'input-price-quote'}
                className="w-full"
                type="number"
                step={priceStep}
                data-testid={oco ? 'order-ocoPrice' : 'order-price'}
                onWheel={(e) => e.currentTarget.blur()}
                value={value || ''}
                hasError={!!fieldState.error}
                {...props}
              />
            </FormGroup>
            {fieldState.error && (
              <InputError
                testId={
                  oco
                    ? 'stop-order-error-message-oco-price'
                    : 'stop-order-error-message-price'
                }
              >
                {fieldState.error.message}
              </InputError>
            )}
          </div>
        );
      }}
    />
  );
};

const TimeInForce = ({
  control,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
}) => (
  <Controller
    name="timeInForce"
    control={control}
    render={({ field, fieldState }) => (
      <div className="mb-2">
        <FormGroup
          label={t('Time in force')}
          labelFor="select-time-in-force"
          compact={true}
        >
          <Select
            id="select-time-in-force"
            className="w-full"
            data-testid="order-tif"
            hasError={!!fieldState.error}
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
        </FormGroup>
        {fieldState.error && (
          <InputError testId="stop-error-message-tif">
            {fieldState.error.message}
          </InputError>
        )}
      </div>
    )}
  />
);

const ReduceOnly = () => (
  <Checkbox
    name="reduce-only"
    checked={true}
    disabled={true}
    label={
      <Tooltip description={<span>{t(REDUCE_ONLY_TOOLTIP)}</span>}>
        <>{t('Reduce only')}</>
      </Tooltip>
    }
  />
);

export const StopOrder = ({ market, marketPrice, submit }: StopOrderProps) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const setType = useDealTicketFormValues((state) => state.setType);
  const updateStoredFormValues = useDealTicketFormValues(
    (state) => state.updateStopOrder
  );
  const storedFormValues = useDealTicketFormValues(
    (state) => state.formValues[market.id]
  );
  const dealTicketType = storedFormValues?.type ?? DealTicketType.StopLimit;
  const type = dealTicketTypeToOrderType(dealTicketType);
  const { handleSubmit, setValue, watch, control, formState, reset } =
    useForm<StopOrderFormValues>({
      defaultValues: getDefaultValues(type, storedFormValues?.[dealTicketType]),
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
  const triggerDirection = watch('triggerDirection');
  const triggerPrice = watch('triggerPrice');
  const timeInForce = watch('timeInForce');
  const rawPrice = watch('price');
  const rawSize = watch('size');
  const oco = watch('oco');
  const expiryStrategy = watch('expiryStrategy');

  useEffect(() => {
    const size = storedFormValues?.[dealTicketType]?.size;
    if (size && rawSize !== size) {
      setValue('size', size);
    }
  }, [storedFormValues, dealTicketType, rawSize, setValue]);

  useEffect(() => {
    const price = storedFormValues?.[dealTicketType]?.price;
    if (price && rawPrice !== price) {
      setValue('price', price);
    }
  }, [storedFormValues, dealTicketType, rawPrice, setValue]);

  const isPriceTrigger = triggerType === 'price';
  const size = removeDecimal(rawSize, market.positionDecimalPlaces);
  const price =
    marketPrice &&
    getDerivedPrice(
      {
        type,
        price: rawPrice && removeDecimal(rawPrice, market.decimalPlaces),
      },
      type === Schema.OrderType.TYPE_MARKET && isPriceTrigger && triggerPrice
        ? removeDecimal(triggerPrice, market.decimalPlaces)
        : marketPrice
    );

  const notionalSize = getNotionalSize(
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

  useController({
    name: 'type',
    control,
  });

  return (
    <form
      onSubmit={isReadOnly || !pubKey ? stopSubmit : handleSubmit(onSubmit)}
      noValidate
    >
      <TypeToggle
        value={dealTicketType}
        onValueChange={(dealTicketType) => {
          setType(market.id, dealTicketType);
          if (isStopOrderType(dealTicketType)) {
            reset(
              getDefaultValues(
                dealTicketTypeToOrderType(dealTicketType),
                storedFormValues?.[dealTicketType]
              )
            );
          }
        }}
      />
      {errors.type && (
        <InputError testId="stop-order-error-message-type">
          {errors.type.message}
        </InputError>
      )}

      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <SideSelector value={field.value} onValueChange={field.onChange} />
        )}
      />
      <Trigger
        control={control}
        watch={watch}
        priceStep={priceStep}
        assetSymbol={asset.symbol}
      />
      <hr className="mb-4 border-vega-clight-500 dark:border-vega-cdark-500" />
      <Price
        control={control}
        watch={watch}
        priceStep={priceStep}
        quoteName={quoteName}
      />
      <Size control={control} sizeStep={sizeStep} />
      <TimeInForce control={control} />
      <div className="flex gap-2 pb-3 justify-end">
        <ReduceOnly />
      </div>
      <hr className="mb-4 border-vega-clight-500 dark:border-vega-cdark-500" />
      <div className="flex gap-2 pb-2 justify-between">
        <Controller
          name="oco"
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <Checkbox
                onCheckedChange={(state) => {
                  onChange(state);
                  if (state && expiryStrategy === 'submit') {
                    setValue(
                      'expiryStrategy',
                      triggerDirection ===
                        Schema.StopOrderTriggerDirection
                          .TRIGGER_DIRECTION_FALLS_BELOW
                        ? 'submitFallsBelow'
                        : 'submitRisesAbove'
                    );
                  } else if (
                    (!state && expiryStrategy === 'submitFallsBelow') ||
                    expiryStrategy === 'submitRisesAbove'
                  ) {
                    setValue('expiryStrategy', 'submit');
                  }
                }}
                checked={value}
                name="oco"
                label={
                  <Tooltip
                    description={<span>{t('One cancels another')}</span>}
                  >
                    <>{t('OCO')}</>
                  </Tooltip>
                }
              />
            );
          }}
        />
      </div>
      {oco && (
        <>
          <FormGroup label={t('Type')} labelFor="">
            <Controller
              name={`ocoType`}
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
                      value={Schema.OrderType.TYPE_MARKET}
                      id={`ocoTypeMarket`}
                      label={'Market'}
                    />
                    <Radio
                      value={Schema.OrderType.TYPE_LIMIT}
                      id={`ocoTypeLimit`}
                      label={'Limit'}
                    />
                  </RadioGroup>
                );
              }}
            />
          </FormGroup>
          <Trigger
            control={control}
            watch={watch}
            priceStep={priceStep}
            assetSymbol={asset.symbol}
            oco
          />
          <hr className="mb-2 border-vega-clight-500 dark:border-vega-cdark-500" />
          <Price
            control={control}
            watch={watch}
            priceStep={priceStep}
            quoteName={quoteName}
            oco
          />
          <Size control={control} sizeStep={sizeStep} oco />
          <TimeInForce control={control} oco />
          <div className="flex gap-2 mb-2 justify-end">
            <ReduceOnly />
          </div>
        </>
      )}
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
                label={t('Expire')}
              />
            );
          }}
        />
      </div>
      {expire && (
        <>
          <FormGroup label={t('Strategy')} labelFor="expiryStrategy">
            <Controller
              name="expiryStrategy"
              control={control}
              render={({ field }) => {
                const { onChange, value } = field;
                return (
                  <RadioGroup
                    onChange={onChange}
                    value={value}
                    orientation={oco ? 'vertical' : 'horizontal'}
                  >
                    {!oco && (
                      <Radio
                        value="submit"
                        id="expiryStrategy-submit"
                        label={'Submit'}
                      />
                    )}
                    {oco && (
                      <>
                        <Radio
                          value="submitRisesAbove"
                          id="expiryStrategy-submitRisesAbove"
                          label={'Submit rises above'}
                        />
                        <Radio
                          value="submitFallsBelow"
                          id="expiryStrategySubmitFallsBelow"
                          label={'Submit falls below'}
                        />
                      </>
                    )}
                    <Radio
                      value="cancel"
                      id="expiryStrategy-cancel"
                      label={'Cancel'}
                    />
                  </RadioGroup>
                );
              }}
            />
          </FormGroup>
          <div className="mb-4">
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
      <NoWalletWarning isReadOnly={isReadOnly} />
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
