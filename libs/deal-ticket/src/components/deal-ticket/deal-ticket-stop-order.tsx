import { useRef, useCallback, useEffect } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type {
  OrderSubmissionBody,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  formatForInput,
  formatValue,
  removeDecimal,
  toDecimal,
  validateAmount,
} from '@vegaprotocol/utils';
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
  TradingButton as Button,
  Pill,
  Intent,
  Notification,
} from '@vegaprotocol/ui-toolkit';
import {
  getAsset,
  getDerivedPrice,
  getQuoteName,
  type Market,
} from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { timeInForceLabel } from '@vegaprotocol/orders';
import {
  NoWalletWarning,
  REDUCE_ONLY_TOOLTIP,
  stopSubmit,
  getNotionalSize,
  getBaseQuoteUnit,
} from './deal-ticket';
import { TypeToggle } from './type-selector';
import {
  useDealTicketFormValues,
  DealTicketType,
  dealTicketTypeToOrderType,
  isStopOrderType,
} from '../../hooks/use-form-values';
import type { StopOrderFormValues } from '../../hooks/use-form-values';
import { mapFormValuesToStopOrdersSubmission } from '../../utils/map-form-values-to-submission';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { validateExpiration } from '../../utils';
import { NOTIONAL_SIZE_TOOLTIP_TEXT } from '../../constants';
import { KeyValue } from './key-value';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { stopOrdersProvider } from '@vegaprotocol/orders';

export interface StopOrderProps {
  market: Market;
  marketPrice?: string | null;
  submit: (order: StopOrdersSubmission) => void;
}

const MAX_NUMBER_OF_ACTIVE_STOP_ORDERS = 4;
const POLLING_TIME = 2000;
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
  expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT,
  size: '0',
  oco: false,
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
  quoteName,
  oco,
  marketPrice,
  decimalPlaces,
}: {
  control: Control<StopOrderFormValues>;
  watch: UseFormWatch<StopOrderFormValues>;
  priceStep: string;
  quoteName: string;
  oco?: boolean;
  marketPrice?: string | null;
  decimalPlaces: number;
}) => {
  const triggerType = watch(oco ? 'ocoTriggerType' : 'triggerType');
  const triggerDirection = watch('triggerDirection');
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
                id={`triggerDirection-risesAbove${oco ? '-oco' : ''}`}
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
                id={`triggerDirection-fallsBelow${oco ? '-oco' : ''}`}
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
              let triggerWarning = false;

              if (marketPrice && value) {
                const condition =
                  (!oco &&
                    triggerDirection ===
                      Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_RISES_ABOVE) ||
                  (oco &&
                    triggerDirection ===
                      Schema.StopOrderTriggerDirection
                        .TRIGGER_DIRECTION_FALLS_BELOW)
                    ? '>'
                    : '<';
                const diff =
                  BigInt(marketPrice) -
                  BigInt(removeDecimal(value, decimalPlaces));
                if (
                  (condition === '>' && diff > 0) ||
                  (condition === '<' && diff < 0)
                ) {
                  triggerWarning = true;
                }
              }
              return (
                <>
                  <div className="mb-2">
                    <Input
                      data-testid={`triggerPrice${oco ? '-oco' : ''}`}
                      type="number"
                      step={priceStep}
                      appendElement={<Pill size="xs">{quoteName}</Pill>}
                      value={value || ''}
                      hasError={!!fieldState.error}
                      {...props}
                    />
                  </div>
                  {fieldState.error && (
                    <InputError
                      testId={`stop-order-error-message-trigger-price${
                        oco ? '-oco' : ''
                      }`}
                    >
                      {fieldState.error.message}
                    </InputError>
                  )}
                  {!fieldState.error && triggerWarning && (
                    <InputError
                      intent="warning"
                      testId={`stop-order-warning-message-trigger-price${
                        oco ? '-oco' : ''
                      }`}
                    >
                      {t('Stop order will be triggered immediately')}
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
                      appendElement={<Pill size="xs">%</Pill>}
                      data-testid={`triggerTrailingPercentOffset${
                        oco ? '-oco' : ''
                      }`}
                      value={value || ''}
                      hasError={!!fieldState.error}
                      {...props}
                    />
                  </div>
                  {fieldState.error && (
                    <InputError
                      testId={`stop-order-error-message-trigger-trailing-percent-offset${
                        oco ? '-oco' : ''
                      }`}
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
                id={`triggerType-price${oco ? '-oco' : ''}`}
                label={'Price'}
              />
              <Radio
                value="trailingPercentOffset"
                id={`triggerType-trailingPercentOffset${oco ? '-oco' : ''}`}
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
  isLimitType,
  assetUnit,
}: {
  control: Control<StopOrderFormValues>;
  sizeStep: string;
  oco?: boolean;
  isLimitType: boolean;
  assetUnit?: string;
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
        const id = `order-size${oco ? '-oco' : ''}`;
        return (
          <div className={isLimitType ? 'mb-4' : 'mb-2'}>
            <FormGroup labelFor={id} label={t(`Size`)} compact>
              <Input
                id={id}
                className="w-full"
                type="number"
                step={sizeStep}
                min={sizeStep}
                onWheel={(e) => e.currentTarget.blur()}
                appendElement={assetUnit && <Pill size="xs">{assetUnit}</Pill>}
                data-testid={id}
                value={value || ''}
                hasError={!!fieldState.error}
                {...props}
              />
            </FormGroup>
            {fieldState.error && (
              <InputError
                testId={`stop-order-error-message-size${oco ? '-oco' : ''}`}
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
        const id = `order-price${oco ? '-oco' : ''}`;
        return (
          <div className="mb-2">
            <FormGroup labelFor={id} label={t('Price')} compact={true}>
              <Input
                id={id}
                className="w-full"
                type="number"
                step={priceStep}
                data-testid={id}
                onWheel={(e) => e.currentTarget.blur()}
                value={value || ''}
                hasError={!!fieldState.error}
                appendElement={<Pill size="xs">{quoteName}</Pill>}
                {...props}
              />
            </FormGroup>
            {fieldState.error && (
              <InputError
                testId={`stop-order-error-message-price${oco ? '-oco' : ''}`}
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
    name={oco ? 'ocoTimeInForce' : 'timeInForce'}
    control={control}
    render={({ field, fieldState }) => {
      const id = `order-tif${oco ? '-oco' : ''}`;
      return (
        <div className="mb-2">
          <FormGroup label={t('Time in force')} labelFor={id} compact={true}>
            <Select
              id={id}
              className="w-full"
              data-testid={id}
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
            <InputError testId={`stop-error-message-tif${oco ? '-oco' : ''}`}>
              {fieldState.error.message}
            </InputError>
          )}
        </div>
      );
    }}
  />
);

const ReduceOnly = () => (
  <Tooltip description={<span>{t(REDUCE_ONLY_TOOLTIP)}</span>}>
    <div>
      <Checkbox
        name="reduce-only"
        checked={true}
        disabled={true}
        label={t('Reduce only')}
      />
    </div>
  </Tooltip>
);

const NotionalAndFees = ({
  market,
  marketPrice,
  side,
  size,
  price,
  timeInForce,
  triggerPrice,
  triggerType,
  type,
}: Pick<
  OrderSubmissionBody['orderSubmission'],
  'side' | 'size' | 'timeInForce' | 'type' | 'price'
> &
  Pick<StopOrderProps, 'market' | 'marketPrice'> &
  Pick<StopOrderFormValues, 'triggerType' | 'triggerPrice'>) => {
  const quoteName = getQuoteName(market);
  const asset = getAsset(market);
  const isPriceTrigger = triggerType === 'price';
  const derivedPrice = getDerivedPrice(
    {
      type,
      price,
    },
    type === Schema.OrderType.TYPE_MARKET && isPriceTrigger && triggerPrice
      ? removeDecimal(triggerPrice, market.decimalPlaces)
      : marketPrice || '0'
  );

  const notionalSize = getNotionalSize(
    derivedPrice,
    size,
    market.decimalPlaces,
    market.positionDecimalPlaces
  );
  return (
    <div className="mb-4 flex flex-col gap-2 w-full">
      <KeyValue
        label={t('Notional')}
        value={formatValue(notionalSize, market.decimalPlaces)}
        formattedValue={formatValue(notionalSize, market.decimalPlaces)}
        symbol={quoteName}
        labelDescription={NOTIONAL_SIZE_TOOLTIP_TEXT(quoteName)}
      />
      <DealTicketFeeDetails
        order={{
          marketId: market.id,
          price: derivedPrice,
          side,
          size,
          timeInForce,
          type,
        }}
        assetSymbol={asset.symbol}
        market={market}
      />
    </div>
  );
};

const formatSizeAtPrice = ({
  assetUnit,
  decimalPlaces,
  positionDecimalPlaces,
  price,
  quoteName,
  side,
  size,
  type,
}: Pick<StopOrderFormValues, 'price' | 'side' | 'size' | 'type'> & {
  assetUnit?: string;
  decimalPlaces: number;
  positionDecimalPlaces: number;
  quoteName: string;
}) =>
  `${formatValue(
    removeDecimal(size, positionDecimalPlaces),
    positionDecimalPlaces
  )} ${assetUnit} @ ${
    type === Schema.OrderType.TYPE_MARKET
      ? 'market'
      : `${formatValue(
          removeDecimal(price || '0', decimalPlaces),
          decimalPlaces
        )} ${quoteName}`
  }`;
const formatTrigger = ({
  decimalPlaces,
  triggerDirection,
  triggerPrice,
  triggerTrailingPercentOffset,
  triggerType,
  quoteName,
}: Pick<
  StopOrderFormValues,
  | 'triggerDirection'
  | 'triggerType'
  | 'triggerPrice'
  | 'triggerTrailingPercentOffset'
> & {
  decimalPlaces: number;
  quoteName: string;
}) =>
  `${
    triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
      ? t('above')
      : t('below')
  } ${
    triggerType === 'price'
      ? `${formatValue(
          removeDecimal(triggerPrice || '', decimalPlaces),
          decimalPlaces
        )} ${quoteName}`
      : `${(Number(triggerTrailingPercentOffset) || 0).toFixed(1)}% ${t(
          'trailing'
        )}`
  }`;

const SubmitButton = ({
  assetUnit,
  market,
  oco,
  ocoPrice,
  ocoSize,
  ocoTriggerPrice,
  ocoTriggerTrailingPercentOffset,
  ocoTriggerType,
  ocoType,
  price,
  side,
  size,
  triggerDirection,
  triggerPrice,
  triggerTrailingPercentOffset,
  triggerType,
  type,
}: Pick<
  StopOrderFormValues,
  | 'oco'
  | 'ocoPrice'
  | 'ocoSize'
  | 'ocoTriggerPrice'
  | 'ocoTriggerTrailingPercentOffset'
  | 'ocoTriggerType'
  | 'ocoType'
  | 'price'
  | 'side'
  | 'size'
  | 'triggerDirection'
  | 'triggerPrice'
  | 'triggerTrailingPercentOffset'
  | 'triggerType'
  | 'type'
> &
  Pick<StopOrderProps, 'market'> & { assetUnit?: string }) => {
  const quoteName = getQuoteName(market);
  const risesAbove =
    triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;
  const subLabel = oco ? (
    <>
      {formatSizeAtPrice({
        assetUnit,
        decimalPlaces: market.decimalPlaces,
        positionDecimalPlaces: market.positionDecimalPlaces,
        price: risesAbove ? price : ocoPrice,
        quoteName,
        side,
        size: risesAbove ? size : ocoSize,
        type,
      })}{' '}
      {formatTrigger({
        decimalPlaces: market.decimalPlaces,
        quoteName,
        triggerDirection:
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
        triggerPrice: risesAbove ? triggerPrice : ocoTriggerPrice,
        triggerTrailingPercentOffset: risesAbove
          ? triggerTrailingPercentOffset
          : ocoTriggerTrailingPercentOffset,
        triggerType: risesAbove ? triggerType : ocoTriggerType,
      })}
      <br />
      {formatSizeAtPrice({
        assetUnit,
        decimalPlaces: market.decimalPlaces,
        positionDecimalPlaces: market.positionDecimalPlaces,
        price: !risesAbove ? price : ocoPrice,
        quoteName,
        side,
        size: !risesAbove ? size : ocoSize,
        type: ocoType,
      })}{' '}
      {formatTrigger({
        decimalPlaces: market.decimalPlaces,
        quoteName,
        triggerDirection:
          Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
        triggerPrice: !risesAbove ? triggerPrice : ocoTriggerPrice,
        triggerTrailingPercentOffset: !risesAbove
          ? triggerTrailingPercentOffset
          : ocoTriggerTrailingPercentOffset,
        triggerType: !risesAbove ? triggerType : ocoTriggerType,
      })}
    </>
  ) : (
    <>
      {formatSizeAtPrice({
        assetUnit,
        decimalPlaces: market.decimalPlaces,
        positionDecimalPlaces: market.positionDecimalPlaces,
        price,
        quoteName,
        side,
        size,
        type,
      })}
      <br />
      {t('Trigger')}{' '}
      {formatTrigger({
        decimalPlaces: market.decimalPlaces,
        quoteName,
        triggerDirection,
        triggerPrice,
        triggerTrailingPercentOffset,
        triggerType,
      })}
    </>
  );
  return (
    <Button
      intent={side === Schema.Side.SIDE_BUY ? Intent.Success : Intent.Danger}
      data-testid="place-order"
      type="submit"
      className="w-full"
      subLabel={subLabel}
    >
      {t(
        oco
          ? 'Place OCO stop order'
          : type === Schema.OrderType.TYPE_MARKET
          ? 'Place market stop order'
          : 'Place limit stop order'
      )}
    </Button>
  );
};

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
  const expire = watch('expire');
  const expiresAt = watch('expiresAt');
  const oco = watch('oco');
  const ocoPrice = watch('ocoPrice');
  const ocoSize = watch('ocoSize');
  const ocoTimeInForce = watch('ocoTimeInForce');
  const ocoTriggerPrice = watch('ocoTriggerPrice');
  const ocoTriggerTrailingPercentOffset = watch(
    'ocoTriggerTrailingPercentOffset'
  );
  const ocoTriggerType = watch('ocoTriggerType');
  const ocoType = watch('ocoType');
  const price = watch('price');
  const side = watch('side');
  const size = watch('size');
  const timeInForce = watch('timeInForce');
  const triggerDirection = watch('triggerDirection');
  const triggerPrice = watch('triggerPrice');
  const triggerTrailingPercentOffset = watch('triggerTrailingPercentOffset');
  const triggerType = watch('triggerType');

  const { data: activeStopOrders, reload } = useDataProvider({
    dataProvider: stopOrdersProvider,
    variables: {
      filter: {
        parties: pubKey ? [pubKey] : [],
        markets: [market.id],
        liveOnly: true,
      },
    },
    skip: !(pubKey && (formState.isDirty || formState.submitCount)),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, POLLING_TIME);
    return () => {
      clearInterval(interval);
    };
  }, [reload]);

  useEffect(() => {
    const storedSize = storedFormValues?.[dealTicketType]?.size;
    if (storedSize && size !== storedSize) {
      setValue('size', storedSize);
    }
  }, [storedFormValues, dealTicketType, size, setValue]);

  useEffect(() => {
    const storedPrice = storedFormValues?.[dealTicketType]?.price;
    if (storedPrice && price !== storedPrice) {
      setValue('price', storedPrice);
    }
  }, [storedFormValues, dealTicketType, price, setValue]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      updateStoredFormValues(market.id, value);
    });
    return () => subscription.unsubscribe();
  }, [watch, market.id, updateStoredFormValues]);

  const quoteName = getQuoteName(market);
  const assetUnit = getBaseQuoteUnit(
    market.tradableInstrument.instrument.metadata.tags
  );

  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const priceStep = toDecimal(market?.decimalPlaces);

  useController({
    name: 'type',
    control,
  });

  const normalizedPrice = price && removeDecimal(price, market.decimalPlaces);
  const normalizedSize =
    size && removeDecimal(size, market.positionDecimalPlaces);

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
        quoteName={quoteName}
        marketPrice={marketPrice}
        decimalPlaces={market.decimalPlaces}
      />
      <hr className="mb-4 border-vega-clight-500 dark:border-vega-cdark-500" />
      <Size
        control={control}
        sizeStep={sizeStep}
        isLimitType={type === Schema.OrderType.TYPE_LIMIT}
        assetUnit={assetUnit}
      />
      <Price
        control={control}
        watch={watch}
        priceStep={priceStep}
        quoteName={quoteName}
      />
      <NotionalAndFees
        market={market}
        marketPrice={marketPrice}
        price={normalizedPrice}
        side={side}
        size={normalizedSize}
        timeInForce={timeInForce}
        triggerPrice={triggerPrice}
        triggerType={triggerType}
        type={type}
      />
      <TimeInForce control={control} />
      <div className="flex justify-end pb-3 gap-2">
        <ReduceOnly />
      </div>
      <hr className="mb-4 border-vega-clight-500 dark:border-vega-cdark-500" />
      <div className="flex justify-between pb-2 gap-2">
        <Controller
          name="oco"
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <Checkbox
                onCheckedChange={(state) => {
                  onChange(state);
                  setValue(
                    'expiryStrategy',
                    Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS
                  );
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
                      id="ocoTypeMarket"
                      label={'Market'}
                    />
                    <Radio
                      value={Schema.OrderType.TYPE_LIMIT}
                      id="ocoTypeLimit"
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
            quoteName={quoteName}
            marketPrice={marketPrice}
            decimalPlaces={market.decimalPlaces}
            oco
          />
          <hr className="mb-2 border-vega-clight-500 dark:border-vega-cdark-500" />
          <Size
            control={control}
            sizeStep={sizeStep}
            assetUnit={assetUnit}
            oco
            isLimitType={ocoType === Schema.OrderType.TYPE_LIMIT}
          />
          <Price
            control={control}
            watch={watch}
            priceStep={priceStep}
            quoteName={quoteName}
            oco
          />
          <NotionalAndFees
            market={market}
            marketPrice={marketPrice}
            price={ocoPrice && removeDecimal(ocoPrice, market.decimalPlaces)}
            side={side}
            size={
              ocoSize && removeDecimal(ocoSize, market.positionDecimalPlaces)
            }
            timeInForce={ocoTimeInForce}
            triggerPrice={ocoTriggerPrice}
            triggerType={ocoTriggerType}
            type={ocoType}
          />
          <TimeInForce control={control} oco />
          <div className="flex justify-end mb-2 gap-2">
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
                onCheckedChange={(value) => {
                  const now = Date.now();
                  if (
                    value &&
                    (!expiresAt || new Date(expiresAt).getTime() < now)
                  ) {
                    setValue('expiresAt', formatForInput(new Date(now)), {
                      shouldValidate: true,
                    });
                  }
                  onCheckedChange(value);
                }}
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
                    orientation="horizontal"
                  >
                    <Radio
                      disabled={oco}
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
          <div className="mb-4">
            <Controller
              name="expiresAt"
              control={control}
              rules={{
                required: t('You need provide a expiry time/date'),
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
      {(activeStopOrders?.length ?? 0) + (oco ? 2 : 1) >
      MAX_NUMBER_OF_ACTIVE_STOP_ORDERS ? (
        <div className="mb-2">
          <Notification
            intent={Intent.Warning}
            testId={'stop-order-warning-limit'}
            message={t(
              'There is a limit of %s active stop orders per market. Orders submitted above the limit will be immediately rejected.',
              [MAX_NUMBER_OF_ACTIVE_STOP_ORDERS.toString()]
            )}
          />
        </div>
      ) : null}

      <SubmitButton
        assetUnit={assetUnit}
        market={market}
        oco={oco}
        ocoPrice={ocoPrice}
        ocoSize={ocoSize}
        ocoTriggerPrice={ocoTriggerPrice}
        ocoTriggerTrailingPercentOffset={ocoTriggerTrailingPercentOffset}
        ocoTriggerType={ocoTriggerType}
        ocoType={ocoType}
        price={price}
        side={side}
        size={size}
        triggerDirection={triggerDirection}
        triggerPrice={triggerPrice}
        triggerTrailingPercentOffset={triggerTrailingPercentOffset}
        triggerType={triggerType}
        type={type}
      />
    </form>
  );
};
