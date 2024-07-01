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
  TradingInput as Input,
  TradingCheckbox as Checkbox,
  TradingFormGroup as FormGroup,
  TradingInputError as InputError,
  Tooltip,
  Pill,
  Intent,
  Notification,
  ExternalLink,
  PercentageSlider as Slider,
  MiniSelect,
  MiniSelectOption,
  TradingFormGroup,
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
import {
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  REDUCE_ONLY_TOOLTIP,
} from '../../constants';
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
import { SubmitButton } from './submit-button';

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
    <FormGroup label={t('Trigger')} labelFor="triggerDirection" hideLabel>
      <div className="flex gap-4 justify-end mb-2">
        <Controller
          name="triggerDirection"
          control={control}
          render={({ field }) => {
            const { value, onChange } = field;
            return (
              <MiniSelect
                value={value}
                onValueChange={onChange}
                placeholder={t('Select')}
                data-testid={
                  oco ? 'trigger-direction-oco' : 'trigger-direction'
                }
              >
                <MiniSelectOption
                  value={
                    oco
                      ? Schema.StopOrderTriggerDirection
                          .TRIGGER_DIRECTION_FALLS_BELOW
                      : Schema.StopOrderTriggerDirection
                          .TRIGGER_DIRECTION_RISES_ABOVE
                  }
                  id={`triggerDirection-risesAbove${oco ? '-oco' : ''}`}
                >
                  {t('Rises above')}
                </MiniSelectOption>
                <MiniSelectOption
                  value={
                    !oco
                      ? Schema.StopOrderTriggerDirection
                          .TRIGGER_DIRECTION_FALLS_BELOW
                      : Schema.StopOrderTriggerDirection
                          .TRIGGER_DIRECTION_RISES_ABOVE
                  }
                  id={`triggerDirection-fallsBelow${oco ? '-oco' : ''}`}
                >
                  {t('Falls below')}
                </MiniSelectOption>
              </MiniSelect>
            );
          }}
        />
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
              <MiniSelect
                value={value}
                onValueChange={onChange}
                placeholder={t('Select')}
                data-testid={oco ? 'trigger-type-oco' : 'trigger-type'}
              >
                <MiniSelectOption
                  value="price"
                  id={`triggerType-price${oco ? '-oco' : ''}`}
                >
                  {t('Price')}
                </MiniSelectOption>
                <MiniSelectOption
                  value="trailingPercentOffset"
                  id={`triggerType-trailingPercentOffset${oco ? '-oco' : ''}`}
                >
                  {t('Trailing Percent Offset')}
                </MiniSelectOption>
              </MiniSelect>
            );
          }}
        />
      </div>
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
                      placeholder={t('Trigger')}
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
                      placeholder={t('Trigger')}
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
            <FormGroup labelFor={id} label={t(`Size`)} hideLabel>
              <Input
                id={id}
                placeholder={t('Size')}
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
            <FormGroup label={t('Quantity')} labelFor={id} hideLabel>
              <Input
                id={id}
                data-testid={id}
                placeholder={t('Quantity')}
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
              <div className="mt-2">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[Number(field.value)]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </div>
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
            <FormGroup labelFor={id} label={t('Price')} hideLabel>
              <Input
                id={id}
                placeholder={t('Price')}
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
          <MiniSelect
            value={value}
            onValueChange={onChange}
            placeholder={t('Select')}
            data-testid={oco ? 'size-override-oco' : 'size-override'}
          >
            <MiniSelectOption
              value={
                Schema.StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
              }
            >
              {t('Amount')}
            </MiniSelectOption>
            <MiniSelectOption
              value={
                Schema.StopOrderSizeOverrideSetting
                  .SIZE_OVERRIDE_SETTING_POSITION
              }
            >
              {t('Percentage')}
            </MiniSelectOption>
          </MiniSelect>
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
    orderType === Schema.OrderType.TYPE_LIMIT && !isSpotMarket
      ? typeLimitOptions
      : typeMarketOptions;
  return (
    <Controller
      name={oco ? 'ocoTimeInForce' : 'timeInForce'}
      control={control}
      render={({ field, fieldState }) => {
        const id = `order-tif${oco ? '-oco' : ''}`;
        return (
          <div className="mb-2">
            <MiniSelect
              id={id}
              trigger={Schema.OrderTimeInForceCode[field.value]}
              placeholder={t('Select')}
              data-testid={id}
              hasError={!!fieldState.error}
              value={field.value}
              onValueChange={(value) => {
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
                field.onChange(value);
              }}
            >
              {options.map(([key, value]) => (
                <MiniSelectOption key={key} value={value}>
                  {Schema.OrderTimeInForceMapping[value]}{' '}
                </MiniSelectOption>
              ))}
            </MiniSelect>
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
      <TradingFormGroup
        label={t('Expiry time/date')}
        labelFor="expiration"
        compact
      >
        <Controller
          name={oco ? 'ocoOrderExpiresAt' : 'orderExpiresAt'}
          control={control}
          rules={{
            required: t('You need to provide a expiry time/date'),
            validate: validateExpiration(
              t(
                'The expiry date that you have entered appears to be in the past'
              )
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
      </TradingFormGroup>
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
    <div className="my-2 flex w-full flex-col gap-1">
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

const PlaceOrderButton = ({
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
    <SubmitButton
      text={t(
        oco
          ? 'Place OCO stop order'
          : type === Schema.OrderType.TYPE_MARKET
          ? 'Place market stop order'
          : 'Place limit stop order'
      )}
      subLabel={subLabel}
      side={side}
    />
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
    const subscription = watch((value) => {
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
      <FormGroup label={t('Order side')} labelFor="side" hideLabel compact>
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
      </FormGroup>
      <FormGroup label={t('Order type')} labelFor="type" hideLabel>
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
      </FormGroup>
      <Trigger
        control={control}
        watch={watch}
        priceStep={priceStep}
        quoteName={quoteName}
        marketPrice={marketPrice}
        decimalPlaces={market.decimalPlaces}
      />
      <Price
        control={control}
        watch={watch}
        priceStep={priceStep}
        quoteName={quoteName}
      />
      {!isSpotMarket && (
        <div className="flex justify-end mb-2">
          <SizeOverrideSetting control={control} />
        </div>
      )}
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

      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex flex-col items-start gap-1.5">
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
        <div className="flex-1 flex flex-col gap-1 items-end">
          <TimeInForce
            control={control}
            orderType={type}
            isSpotMarket={isSpotMarket}
            setValue={setValue}
            expiresAt={orderExpiresAt}
          />
        </div>
      </div>
      <OrderExpiry
        control={control}
        orderType={type}
        timeInForce={timeInForce}
      />
      {expire && (
        <div>
          <div className="flex justify-between items-center gap-2 mb-2">
            <label htmlFor="expiresAt" className="text-muted text-xs">
              {t('Stop expiry time/date')}
            </label>
            {!oco && (
              <Controller
                name="expiryStrategy"
                control={control}
                render={({ field }) => {
                  const { onChange, value } = field;
                  return (
                    <MiniSelect
                      placeholder={t('Strategy')}
                      onValueChange={onChange}
                      value={value}
                      trigger={
                        value
                          ? Schema.StopOrderExpirtyStrategyMapping[value]
                          : t('Strategy')
                      }
                      data-testid="stop-expiry-strategy"
                    >
                      <MiniSelectOption
                        disabled={oco}
                        value={
                          Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT
                        }
                        id="expiryStrategy-submit"
                      >
                        {t('Submit')}
                      </MiniSelectOption>
                      <MiniSelectOption
                        value={
                          Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS
                        }
                        id="expiryStrategy-cancel"
                      >
                        {t('Cancel')}
                      </MiniSelectOption>
                    </MiniSelect>
                  );
                }}
              />
            )}
          </div>
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
        </div>
      )}
      {oco && (
        <>
          <hr className="border-vega-clight-500 dark:border-vega-cdark-500 my-4" />
          <Trigger
            control={control}
            watch={watch}
            priceStep={priceStep}
            quoteName={quoteName}
            marketPrice={marketPrice}
            decimalPlaces={market.decimalPlaces}
            oco
          />
          <div className="flex justify-between mb-2">
            <Controller
              name={`ocoType`}
              control={control}
              render={({ field }) => {
                const { onChange, value } = field;
                return (
                  <MiniSelect
                    placeholder={t('Select')}
                    value={value}
                    onValueChange={onChange}
                    data-testid="oco-type"
                  >
                    <MiniSelectOption
                      id="ocoTypeMarket"
                      value={Schema.OrderType.TYPE_MARKET}
                    >
                      {t('Market')}
                    </MiniSelectOption>
                    <MiniSelectOption
                      id="ocoTypeLimit"
                      value={Schema.OrderType.TYPE_LIMIT}
                    >
                      {t('Limit')}
                    </MiniSelectOption>
                  </MiniSelect>
                );
              }}
            />
            {!isSpotMarket && <SizeOverrideSetting control={control} oco />}
          </div>
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
          <Price
            control={control}
            watch={watch}
            priceStep={priceStep}
            quoteName={quoteName}
            oco
          />
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex flex-col items-start gap-1.5">
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
            <div className="flex-1 flex flex-col items-end gap-1.5">
              <TimeInForce
                control={control}
                oco
                orderType={ocoType}
                isSpotMarket={isSpotMarket}
                setValue={setValue}
                expiresAt={ocoOrderExpiresAt}
              />
            </div>
          </div>
          <OrderExpiry
            control={control}
            oco
            orderType={ocoType}
            timeInForce={ocoTimeInForce}
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
      <PlaceOrderButton
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
    </form>
  );
};
