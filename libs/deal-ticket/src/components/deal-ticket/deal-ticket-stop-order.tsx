import { useRef, useCallback, useEffect } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  type OrderSubmissionBody,
  type StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  formatForInput,
  formatValue,
  removeDecimal,
  toBigNum,
  useValidateAmount,
  validateAgainstStep,
} from '@vegaprotocol/utils';
import {
  type UseFormSetValue,
  type Control,
  type UseFormWatch,
} from 'react-hook-form';
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
  ExternalLink,
  PercentageSlider as Slider,
} from '@vegaprotocol/ui-toolkit';
import {
  getAsset,
  getBaseAsset,
  getDerivedPrice,
  getQuoteName,
  isSpot,
  type Market,
} from '@vegaprotocol/markets';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
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
  type StopOrderFormValues,
} from '@vegaprotocol/react-helpers';
import { mapFormValuesToStopOrdersSubmission } from '../../utils/map-form-values-to-submission';
import { DealTicketFeeDetails } from './deal-ticket-fee-details';
import { validateExpiration } from '../../utils';
import { NOTIONAL_SIZE_TOOLTIP_TEXT } from '../../constants';
import { KeyValue } from './key-value';
import { useActiveOrders, useActiveStopOrders } from '@vegaprotocol/orders';
import { useT } from '../../use-t';
import { determinePriceStep, determineSizeStep } from '@vegaprotocol/utils';
import { useOpenVolume } from '@vegaprotocol/positions';
import { useNetworkParamQuery } from '@vegaprotocol/network-parameters';
import { DocsLinks } from '@vegaprotocol/environment';
import { isNonPersistentOrder } from '../../utils/time-in-force-persistence';
import { useAccountBalance } from '@vegaprotocol/accounts';
import { ZeroBalanceError } from '../deal-ticket-validation/zero-balance-error';
import { MarginWarning } from '../deal-ticket-validation';

export interface StopOrderProps {
  market: Market;
  marketPrice?: string | null;
  submit: (order: StopOrdersSubmission) => void;
  onDeposit: (assetId: string) => void;
}

const typeLimitOptions = Object.entries(Schema.OrderTimeInForce);
const typeMarketOptions = typeLimitOptions.filter(
  ([_, timeInForce]) =>
    timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_FOK ||
    timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
);

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
  sizeOverrideSetting:
    Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
  size: '0',
  oco: false,
  ocoType: type,
  ocoTimeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
  ocoSizeOverrideSetting:
    Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE,
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
  const t = useT();
  const validateAmount = useValidateAmount();
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
              required: t('You need to provide a price'),
              min: {
                value: priceStep,
                message: t('Price cannot be lower than {{priceStep}}', {
                  priceStep,
                }),
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
              required: t('You need to provide a trailing percent offset'),
              min: {
                value: trailingPercentOffsetStep,
                message: t(
                  'Trailing percent offset cannot be lower than {{trailingPercentOffsetStep}}',
                  { trailingPercentOffsetStep }
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
  const t = useT();
  const validateAmount = useValidateAmount();
  return (
    <Controller
      name={oco ? 'ocoSize' : 'size'}
      control={control}
      rules={{
        required: t('You need to provide a size'),
        min: {
          value: sizeStep,
          message: t('Size cannot be lower than {{sizeStep}}', { sizeStep }),
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

const SizeOverrideValue = ({
  control,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
}) => {
  const t = useT();
  const sizeStep = 1;
  const maxSize = 100;
  return (
    <Controller
      name={oco ? 'ocoSizeOverrideValue' : 'sizeOverrideValue'}
      control={control}
      rules={{
        required: t('You need to provide a quantity'),
        min: {
          value: sizeStep,
          message: t('Quantity cannot be lower than {{sizeStep}}', {
            sizeStep,
          }),
        },
        max: {
          value: maxSize,
          message: t('Quantity cannot be greater than {{maxSize}}', {
            maxSize,
          }),
        },
        validate: (value?: string) => {
          const isValid = value ? validateAgainstStep(sizeStep, value) : true;
          if (!isValid) {
            return t('Quantity must be whole numbers');
          }
          return true;
        },
      }}
      render={({ field, fieldState }) => {
        const id = `sizeOverrideValue${oco ? '-oco' : ''}`;
        return (
          <>
            <FormGroup label={t('Quantity')} labelFor={id} compact>
              <Input
                id={id}
                data-testid={id}
                type="number"
                className="w-full"
                min={sizeStep}
                max={maxSize}
                step={sizeStep}
                appendElement={<Pill size="xs">%</Pill>}
                hasError={!!fieldState.error}
                {...field}
                value={field.value || ''}
              />
              <Slider
                min={0}
                max={100}
                step={1}
                value={[Number(field.value)]}
                onValueChange={([value]) => field.onChange(value)}
              />
            </FormGroup>
            {fieldState.error && (
              <InputError
                testId={`stop-order-error-message-sizeOverrideValue${
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
  const t = useT();
  const validateAmount = useValidateAmount();
  if (watch(oco ? 'ocoType' : 'type') === Schema.OrderType.TYPE_MARKET) {
    return null;
  }
  return (
    <Controller
      name={oco ? 'ocoPrice' : 'price'}
      control={control}
      rules={{
        deps: 'type',
        required: t('You need to provide a price'),
        min: {
          value: priceStep,
          message: t('Price cannot be lower than {{priceStep}}', { priceStep }),
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

const SizeOverrideSetting = ({
  control,
  oco,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
}) => {
  const t = useT();
  return (
    <Controller
      name={oco ? 'ocoSizeOverrideSetting' : 'sizeOverrideSetting'}
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
              value={
                Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
              }
              id={`sizeOverrideSetting-none${oco ? '-oco' : ''}`}
              label={t('Amount')}
            />
            <Radio
              value={
                Schema.StopOrderSizeOverrideSetting
                  .SIZE_OVERRIDE_SETTING_POSITION
              }
              id={`sizeOverrideSetting-position${oco ? '-oco' : ''}`}
              label={t('Percentage')}
            />
          </RadioGroup>
        );
      }}
    />
  );
};

const NotEnoughBalanceWarning = ({
  market,
  useBaseAsset,
  onDeposit,
  size,
}: {
  market: Market;
  useBaseAsset?: boolean;
  onDeposit: (assetId: string) => void;
  size?: string;
}) => {
  const asset = getAsset(market);
  const baseAsset = getBaseAsset(market);

  const {
    accountBalance: generalAccountBalance,
    // accountDecimals,
    loading: loadingGeneralAccountBalance,
  } = useAccountBalance(asset.id);

  const {
    accountBalance: baseAssetAccountBalance,
    // accountDecimals: baseAssetDecimals,
    loading: loadingBaseAssetAccount,
  } = useAccountBalance(baseAsset?.id);

  const balance = useBaseAsset
    ? baseAssetAccountBalance
    : generalAccountBalance;

  const hasNoBalance = !BigInt(balance);
  const loading = useBaseAsset
    ? loadingBaseAssetAccount
    : loadingGeneralAccountBalance;
  if (hasNoBalance && !loading) {
    return (
      <ZeroBalanceError
        asset={useBaseAsset ? baseAsset : asset}
        onDeposit={onDeposit}
      />
    );
  }
  if (size && size !== '0' && BigInt(balance) < BigInt(size)) {
    return (
      <MarginWarning
        isSpotMarket={true}
        balance={balance}
        margin={size}
        asset={asset}
        onDeposit={onDeposit}
      />
    );
  }
  return null;
};

export const NoOpenVolumeWarning = ({
  side,
  partyId,
  marketId,
}: {
  side: Schema.Side;
  partyId?: string;
  marketId: string;
}) => {
  const { data: activeOrders } = useActiveOrders(partyId, marketId);
  const t = useT();
  const { openVolume } = useOpenVolume(partyId, marketId) || {};
  const volume = BigInt(openVolume || 0);
  const remaining = activeOrders
    ? activeOrders.reduce((size, order) => {
        if (side !== order.side) {
          size += BigInt(order.remaining);
        }
        return size;
      }, BigInt(0))
    : BigInt(0);

  if (
    (side === Schema.Side.SIDE_BUY && volume - remaining < BigInt(0)) ||
    (side === Schema.Side.SIDE_SELL && volume + remaining > BigInt(0))
  ) {
    return null;
  }
  return (
    <div className="mb-2">
      <Notification
        intent={Intent.Warning}
        testId={'stop-order-warning-position'}
        message={t(
          'Stop orders are reduce only and this order would increase your position.'
        )}
      />
    </div>
  );
};

const TimeInForceOption = ({ value }: { value: Schema.OrderTimeInForce }) => {
  const t = useT();
  return <option value={value}>{t(value)}</option>;
};

const TimeInForce = ({
  control,
  oco,
  orderType,
  isSpotMarket,
  setValue,
  expiresAt,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
  orderType: Schema.OrderType;
  isSpotMarket: boolean;
  setValue: UseFormSetValue<StopOrderFormValues>;
  expiresAt?: string;
}) => {
  const t = useT();
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT && isSpotMarket
      ? typeLimitOptions
      : typeMarketOptions;
  return (
    <Controller
      name={oco ? 'ocoTimeInForce' : 'timeInForce'}
      control={control}
      render={({ field: { onChange, ...field }, fieldState }) => {
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
                onChange={(e) => {
                  const value = e.target.value as Schema.OrderTimeInForce;
                  // If GTT is selected and no expiresAt time is set, or its
                  // behind current time then reset the value to current time
                  const now = Date.now();
                  if (
                    value === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
                    (!expiresAt || new Date(expiresAt).getTime() < now)
                  ) {
                    setValue(
                      oco ? 'ocoOrderExpiresAt' : 'orderExpiresAt',
                      formatForInput(new Date(now)),
                      {
                        shouldValidate: true,
                      }
                    );
                  }
                  onChange(value);
                }}
              >
                {options.map(([key, value]) => (
                  <TimeInForceOption key={key} value={value} />
                ))}
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
};

const OrderExpiry = ({
  control,
  oco,
  orderType,
  timeInForce,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
  orderType: Schema.OrderType;
  timeInForce: Schema.OrderTimeInForce;
}) => {
  const t = useT();
  return (
    orderType === Schema.OrderType.TYPE_LIMIT &&
    timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT && (
      <Controller
        name={oco ? 'ocoOrderExpiresAt' : 'orderExpiresAt'}
        control={control}
        rules={{
          required: t('You need to provide a expiry time/date'),
          validate: validateExpiration(
            t('The expiry date that you have entered appears to be in the past')
          ),
        }}
        render={({ field, fieldState: { error } }) => (
          <ExpirySelector
            value={field.value}
            onSelect={(expiresAt) => field.onChange(expiresAt)}
            errorMessage={error?.message}
          />
        )}
      />
    )
  );
};

const ReduceOnly = () => {
  const t = useT();
  return (
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
};

const PostOnly = ({
  control,
  oco,
  disabled,
}: {
  control: Control<StopOrderFormValues>;
  oco?: boolean;
  disabled?: boolean;
}) => {
  const t = useT();
  const name = oco ? 'ocoPostOnly' : 'postOnly';
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Tooltip
          description={
            <>
              <span>
                {disabled
                  ? t(
                      '"Post only" can not be used on "Fill or Kill" or "Immediate or Cancel" orders.'
                    )
                  : t(
                      '"Post only" will ensure the order is not filled immediately but is placed on the order book as a passive order. When the order is processed it is either stopped (if it would not be filled immediately), or placed in the order book as a passive order until the price taker matches with it.'
                    )}
              </span>{' '}
              <ExternalLink href={DocsLinks?.POST_REDUCE_ONLY}>
                {t('Find out more')}
              </ExternalLink>
            </>
          }
        >
          <div>
            <Checkbox
              name={name}
              checked={!disabled && field.value}
              disabled={disabled}
              onCheckedChange={field.onChange}
              label={t('Post only')}
            />
          </div>
        </Tooltip>
      )}
    />
  );
};

const NotionalAndFees = ({
  market,
  side,
  size,
  notionalSize,
  price,
  timeInForce,
  type,
}: Pick<
  OrderSubmissionBody['orderSubmission'],
  'side' | 'size' | 'timeInForce' | 'type' | 'price'
> &
  Pick<StopOrderProps, 'market' | 'marketPrice'> & {
    notionalSize?: string;
  }) => {
  const t = useT();
  const quoteName = getQuoteName(market);
  const asset = getAsset(market);
  return (
    <div className="mb-4 flex w-full flex-col gap-2">
      <KeyValue
        label={t('Notional')}
        value={formatValue(notionalSize, asset.decimals)}
        formattedValue={formatValue(
          notionalSize,
          asset.decimals,
          asset.quantum
        )}
        symbol={quoteName}
        labelDescription={t(
          'NOTIONAL_SIZE_TOOLTIP_TEXT',
          NOTIONAL_SIZE_TOOLTIP_TEXT,
          { quoteName }
        )}
      />
      <DealTicketFeeDetails
        order={{
          marketId: market.id,
          price,
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

const formatSizeAtPrice = (
  {
    assetUnit,
    decimalPlaces,
    positionDecimalPlaces,
    price,
    quoteName,
    sizeOverrideValue,
    sizeOverrideSetting,
    size,
    type,
  }: Pick<
    StopOrderFormValues,
    'price' | 'sizeOverrideValue' | 'sizeOverrideSetting' | 'size' | 'type'
  > & {
    assetUnit?: string;
    decimalPlaces: number;
    positionDecimalPlaces: number;
    quoteName: string;
  },
  t: ReturnType<typeof useT>
) =>
  `${
    sizeOverrideSetting ===
    Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
      ? `${((Number(sizeOverrideValue) || 0) * 100).toFixed()}%`
      : `${formatValue(
          removeDecimal(size || '0', positionDecimalPlaces),
          positionDecimalPlaces
        )} ${assetUnit}`
  } @ ${
    type === Schema.OrderType.TYPE_MARKET
      ? t('sizeAtPrice-market', 'market')
      : `${formatValue(
          removeDecimal(price || '0', decimalPlaces),
          decimalPlaces
        )} ${quoteName}`
  }`;
const formatTrigger = (
  {
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
  },
  t: ReturnType<typeof useT>
) =>
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
      : t('{{triggerTrailingPercentOffset}}% trailing', {
          triggerTrailingPercentOffset: (
            Number(triggerTrailingPercentOffset) || 0
          ).toFixed(1),
        })
  }`;

const SubmitButton = ({
  assetUnit,
  market,
  oco,
  ocoPrice,
  ocoSize,
  ocoSizeOverrideSetting,
  ocoSizeOverrideValue,
  ocoTriggerPrice,
  ocoTriggerTrailingPercentOffset,
  ocoTriggerType,
  ocoType,
  price,
  side,
  size,
  sizeOverrideSetting,
  sizeOverrideValue,
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
  | 'ocoSizeOverrideSetting'
  | 'ocoSizeOverrideValue'
  | 'ocoTriggerPrice'
  | 'ocoTriggerTrailingPercentOffset'
  | 'ocoTriggerType'
  | 'ocoType'
  | 'price'
  | 'side'
  | 'size'
  | 'sizeOverrideSetting'
  | 'sizeOverrideValue'
  | 'triggerDirection'
  | 'triggerPrice'
  | 'triggerTrailingPercentOffset'
  | 'triggerType'
  | 'type'
> &
  Pick<StopOrderProps, 'market'> & { assetUnit?: string }) => {
  const t = useT();
  const quoteName = getQuoteName(market);
  const risesAbove =
    triggerDirection ===
    Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE;
  const subLabel = oco ? (
    <>
      {formatSizeAtPrice(
        {
          sizeOverrideValue: risesAbove
            ? sizeOverrideValue
            : ocoSizeOverrideValue,
          sizeOverrideSetting: risesAbove
            ? sizeOverrideSetting
            : ocoSizeOverrideSetting,
          assetUnit,
          decimalPlaces: market.decimalPlaces,
          positionDecimalPlaces: market.positionDecimalPlaces,
          price: risesAbove ? price : ocoPrice,
          quoteName,
          size: risesAbove ? size : ocoSize,
          type,
        },
        t
      )}{' '}
      {formatTrigger(
        {
          decimalPlaces: market.decimalPlaces,
          quoteName,
          triggerDirection:
            Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
          triggerPrice: risesAbove ? triggerPrice : ocoTriggerPrice,
          triggerTrailingPercentOffset: risesAbove
            ? triggerTrailingPercentOffset
            : ocoTriggerTrailingPercentOffset,
          triggerType: risesAbove ? triggerType : ocoTriggerType,
        },
        t
      )}
      <br />
      {formatSizeAtPrice(
        {
          sizeOverrideValue: !risesAbove
            ? sizeOverrideValue
            : ocoSizeOverrideValue,
          sizeOverrideSetting: !risesAbove
            ? sizeOverrideSetting
            : ocoSizeOverrideSetting,
          assetUnit,
          decimalPlaces: market.decimalPlaces,
          positionDecimalPlaces: market.positionDecimalPlaces,
          price: !risesAbove ? price : ocoPrice,
          quoteName,
          size: !risesAbove ? size : ocoSize,
          type: ocoType,
        },
        t
      )}{' '}
      {formatTrigger(
        {
          decimalPlaces: market.decimalPlaces,
          quoteName,
          triggerDirection:
            Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
          triggerPrice: !risesAbove ? triggerPrice : ocoTriggerPrice,
          triggerTrailingPercentOffset: !risesAbove
            ? triggerTrailingPercentOffset
            : ocoTriggerTrailingPercentOffset,
          triggerType: !risesAbove ? triggerType : ocoTriggerType,
        },
        t
      )}
    </>
  ) : (
    <>
      {formatSizeAtPrice(
        {
          sizeOverrideSetting,
          sizeOverrideValue,
          assetUnit,
          decimalPlaces: market.decimalPlaces,
          positionDecimalPlaces: market.positionDecimalPlaces,
          price,
          quoteName,
          size,
          type,
        },
        t
      )}
      <br />
      {t('Trigger')}{' '}
      {formatTrigger(
        {
          decimalPlaces: market.decimalPlaces,
          quoteName,
          triggerDirection,
          triggerPrice,
          triggerTrailingPercentOffset,
          triggerType,
        },
        t
      )}
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

const getDerivedPriceAndNotional = ({
  size,
  price,
  positionDecimalPlaces,
  decimalPlaces,
  decimals,
  triggerType,
  triggerPrice,
  marketPrice,
  type,
}: {
  size?: string;
  price?: string;
  positionDecimalPlaces: number;
  decimalPlaces: number;
  decimals: number;
  triggerType: StopOrderFormValues['triggerType'];
  type: StopOrderFormValues['type'];
  marketPrice?: string | null;
  triggerPrice: StopOrderFormValues['triggerPrice'];
}) => {
  const isPriceTrigger = triggerType === 'price';
  const derivedPrice = getDerivedPrice(
    {
      type,
      price,
    },
    type === Schema.OrderType.TYPE_MARKET && isPriceTrigger && triggerPrice
      ? removeDecimal(triggerPrice, decimalPlaces)
      : marketPrice || '0'
  );

  const notionalSize = getNotionalSize(
    derivedPrice,
    size,
    decimalPlaces,
    positionDecimalPlaces,
    decimals
  );
  return { notionalSize, derivedPrice };
};

const normalizePrice = (price: string | undefined, decimalPlaces: number) =>
  price && removeDecimal(price, decimalPlaces);

const normalizeSize = (
  size: string | undefined,
  positionDecimalPlaces: number,
  sizeOverrideSetting: Schema.StopOrderSizeOverrideSetting | undefined,
  sizeOverrideValue: string | undefined,
  openVolume: string | undefined
) =>
  sizeOverrideSetting ===
  Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
    ? toBigNum(openVolume || '0', 0)
        .multipliedBy((Number(sizeOverrideValue) || 0) / 100)
        .toFixed(0)
    : removeDecimal(size || '0', positionDecimalPlaces);

export const StopOrder = ({
  market,
  marketPrice,
  submit,
  onDeposit,
}: StopOrderProps) => {
  const t = useT();
  const { pubKey, isReadOnly } = useVegaWallet();
  const maxNumberOfOrders = useNetworkParamQuery({
    variables: {
      key: 'spam.protection.max.stopOrdersPerMarket',
    },
  }).data?.networkParameter?.value;
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
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
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
          market.positionDecimalPlaces,
          isSpotMarket
        )
      );
      lastSubmitTime.current = now;
    },
    [
      market.id,
      market.decimalPlaces,
      market.positionDecimalPlaces,
      submit,
      isSpotMarket,
    ]
  );
  const expire = watch('expire');
  const expiresAt = watch('expiresAt');
  const oco = watch('oco');
  const ocoPrice = watch('ocoPrice');
  const ocoSize = watch('ocoSize');
  const ocoSizeOverrideSetting = isSpotMarket
    ? Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
    : watch('ocoSizeOverrideSetting');
  const ocoSizeOverrideValue = watch('ocoSizeOverrideValue');
  const ocoTimeInForce = watch('ocoTimeInForce');
  const ocoOrderExpiresAt = watch('ocoOrderExpiresAt');
  const ocoTriggerPrice = watch('ocoTriggerPrice');
  const ocoTriggerTrailingPercentOffset = watch(
    'ocoTriggerTrailingPercentOffset'
  );
  const ocoTriggerType = watch('ocoTriggerType');
  const ocoType = watch('ocoType');
  const price = watch('price');
  const side = watch('side');
  const size = watch('size');
  const sizeOverrideSetting = isSpotMarket
    ? Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
    : watch('sizeOverrideSetting');
  const sizeOverrideValue = watch('sizeOverrideValue');
  const timeInForce = watch('timeInForce');
  const orderExpiresAt = watch('orderExpiresAt');
  const triggerDirection = watch('triggerDirection');
  const triggerPrice = watch('triggerPrice');
  const triggerTrailingPercentOffset = watch('triggerTrailingPercentOffset');
  const triggerType = watch('triggerType');

  const { data: activeStopOrders } = useActiveStopOrders(
    pubKey,
    market.id,
    !formState.isDirty && !formState.submitCount
  );

  const { openVolume } = useOpenVolume(pubKey, market.id) || {};

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

  const asset = getAsset(market);
  const quoteName = getQuoteName(market);
  const assetUnit = getBaseQuoteUnit(
    market.tradableInstrument.instrument.metadata.tags
  );
  const sizeStep = determineSizeStep(market);
  const priceStep = determinePriceStep(market);

  useController({
    name: 'type',
    control,
  });

  const normalizedPrice = normalizePrice(price, market.decimalPlaces);
  const normalizedSize = normalizeSize(
    size,
    market.positionDecimalPlaces,
    sizeOverrideSetting,
    sizeOverrideValue,
    openVolume
  );

  const { derivedPrice, notionalSize } = getDerivedPriceAndNotional({
    price: normalizedPrice,
    decimalPlaces: market.decimalPlaces,
    marketPrice,
    positionDecimalPlaces: market.positionDecimalPlaces,
    decimals: asset.decimals,
    size: normalizedSize,
    triggerPrice,
    triggerType,
    type,
  });

  const ocoNormalizedPrice = normalizePrice(price, market.decimalPlaces);
  const ocoNormalizedSize = normalizeSize(
    size,
    market.positionDecimalPlaces,
    sizeOverrideSetting,
    sizeOverrideValue,
    openVolume
  );
  const { derivedPrice: ocoDerivedPrice, notionalSize: ocoNotionalSize } =
    getDerivedPriceAndNotional({
      price: ocoNormalizedPrice,
      decimalPlaces: market.decimalPlaces,
      marketPrice,
      positionDecimalPlaces: market.positionDecimalPlaces,
      decimals: asset.decimals,
      size: ocoNormalizedSize,
      triggerPrice: ocoTriggerPrice,
      triggerType: ocoTriggerType,
      type: ocoType,
    });
  const useBaseAsset = isSpotMarket && side === Schema.Side.SIDE_SELL;

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
          <SideSelector
            value={field.value}
            onValueChange={field.onChange}
            isSpotMarket={isSpotMarket}
          />
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
      <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-4" />
      {sizeOverrideSetting ===
      Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION ? (
        <SizeOverrideValue control={control} />
      ) : (
        <Size
          control={control}
          sizeStep={sizeStep}
          isLimitType={type === Schema.OrderType.TYPE_LIMIT}
          assetUnit={assetUnit}
        />
      )}
      {!isSpotMarket && <SizeOverrideSetting control={control} />}
      <Price
        control={control}
        watch={watch}
        priceStep={priceStep}
        quoteName={quoteName}
      />
      <NotionalAndFees
        market={market}
        marketPrice={marketPrice}
        price={derivedPrice}
        side={side}
        size={normalizedSize}
        timeInForce={timeInForce}
        type={type}
        notionalSize={notionalSize}
      />
      <TimeInForce
        control={control}
        orderType={type}
        isSpotMarket={isSpotMarket}
        setValue={setValue}
        expiresAt={orderExpiresAt}
      />
      <OrderExpiry
        control={control}
        orderType={type}
        timeInForce={timeInForce}
      />

      <div className="flex justify-end gap-2 pb-3">
        {isSpotMarket ? (
          type === Schema.OrderType.TYPE_LIMIT && (
            <PostOnly
              control={control}
              disabled={isNonPersistentOrder(timeInForce)}
            />
          )
        ) : (
          <ReduceOnly />
        )}
      </div>

      <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-4" />
      <div className="flex justify-between gap-2 pb-2">
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
                    description={<span>{t('One cancels the other')}</span>}
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
          <hr className="border-vega-clight-500 dark:border-vega-cdark-500 mb-2" />
          {ocoSizeOverrideSetting ===
          Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION ? (
            <SizeOverrideValue control={control} oco />
          ) : (
            <Size
              control={control}
              sizeStep={sizeStep}
              isLimitType={ocoType === Schema.OrderType.TYPE_LIMIT}
              assetUnit={assetUnit}
              oco
            />
          )}
          {!isSpotMarket && <SizeOverrideSetting control={control} oco />}
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
            price={ocoDerivedPrice}
            side={side}
            size={ocoNormalizedSize}
            timeInForce={ocoTimeInForce}
            type={ocoType}
            notionalSize={ocoNotionalSize}
          />
          <TimeInForce
            control={control}
            oco
            orderType={ocoType}
            isSpotMarket={isSpotMarket}
            setValue={setValue}
            expiresAt={ocoOrderExpiresAt}
          />
          <OrderExpiry
            control={control}
            oco
            orderType={ocoType}
            timeInForce={ocoTimeInForce}
          />
          {
            <div className="mb-2 flex justify-end gap-2">
              {isSpotMarket ? (
                ocoType === Schema.OrderType.TYPE_LIMIT && (
                  <PostOnly
                    control={control}
                    oco
                    disabled={isNonPersistentOrder(ocoTimeInForce)}
                  />
                )
              ) : (
                <ReduceOnly />
              )}
            </div>
          }
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
                      label={t('Submit')}
                    />
                    <Radio
                      value={
                        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS
                      }
                      id="expiryStrategy-cancel"
                      label={t('Cancel')}
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
                required: t('You need to provide a expiry time/date'),
                validate: validateExpiration(
                  t(
                    'The expiry date that you have entered appears to be in the past'
                  )
                ),
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
      {maxNumberOfOrders &&
      (activeStopOrders?.length ?? 0) + (oco ? 2 : 1) >
        Number(maxNumberOfOrders) ? (
        <div className="mb-2">
          <Notification
            intent={Intent.Warning}
            testId={'stop-order-limit-warning'}
            message={t(
              'There is a limit of {{maxNumberOfOrders}} active stop orders per market. Orders submitted above the limit will be immediately rejected.',
              {
                maxNumberOfOrders,
              }
            )}
          />
        </div>
      ) : isSpotMarket ? (
        <div className="mb-2">
          <NotEnoughBalanceWarning
            market={market}
            useBaseAsset={useBaseAsset}
            onDeposit={onDeposit}
            size={
              useBaseAsset
                ? oco &&
                  ocoNormalizedSize &&
                  normalizedSize &&
                  BigInt(ocoNormalizedSize) > BigInt(normalizedSize)
                  ? ocoNormalizedSize
                  : normalizedSize
                : oco &&
                  ocoNotionalSize &&
                  notionalSize &&
                  BigInt(ocoNotionalSize) > BigInt(notionalSize)
                ? ocoNotionalSize
                : notionalSize
            }
          />
        </div>
      ) : (
        <NoOpenVolumeWarning
          side={side}
          partyId={pubKey}
          marketId={market.id}
        />
      )}
      <SubmitButton
        assetUnit={assetUnit}
        market={market}
        oco={oco}
        ocoPrice={ocoPrice}
        ocoSize={ocoSize}
        ocoSizeOverrideSetting={ocoSizeOverrideSetting}
        ocoSizeOverrideValue={
          ocoSizeOverrideValue &&
          (Number(ocoSizeOverrideValue) / 100).toString()
        }
        ocoTriggerPrice={ocoTriggerPrice}
        ocoTriggerTrailingPercentOffset={ocoTriggerTrailingPercentOffset}
        ocoTriggerType={ocoTriggerType}
        ocoType={ocoType}
        price={price}
        side={side}
        size={size}
        sizeOverrideSetting={sizeOverrideSetting}
        sizeOverrideValue={
          sizeOverrideValue && (Number(sizeOverrideValue) / 100).toString()
        }
        triggerDirection={triggerDirection}
        triggerPrice={triggerPrice}
        triggerTrailingPercentOffset={triggerTrailingPercentOffset}
        triggerType={triggerType}
        type={type}
      />
    </form>
  );
};
