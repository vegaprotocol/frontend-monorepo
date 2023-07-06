import { useRef, useCallback } from 'react';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';
import type { StopOrdersSubmission } from '@vegaprotocol/wallet';
import type { Control } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import * as Schema from '@vegaprotocol/types';
import type { OrderTimeInForce, Side } from '@vegaprotocol/types';
import type { OrderType } from '@vegaprotocol/types';
import {
  Radio,
  RadioGroup,
  Input,
  Checkbox,
  AsyncRenderer,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import type { Market, MarketData } from '@vegaprotocol/markets';
import { marketDataProvider, useMarket } from '@vegaprotocol/markets';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import { t } from '@vegaprotocol/i18n';
import { normalizeOrderSubmission } from '@vegaprotocol/wallet';
import { ExpirySelector } from './expiry-selector';

type Inputs = {
  side: Side;

  fallsBelow: boolean;
  fallsBelowTrigger: 'price' | 'trailingPercentOffset';
  fallsBelowTriggerPrice: string;
  fallsBelowTriggerTrailingPercentOffset: string;

  fallsBelowType: OrderType;
  fallsBelowSize: string;
  fallsBelowTimeInForce: OrderTimeInForce;
  fallsBelowPrice?: string;

  risesAbove: boolean;
  risesAboveTrigger: 'price' | 'trailingPercentOffset';
  risesAboveTriggerPrice: string;
  risesAboveTriggerTrailingPercentOffset: string;

  risesAboveType: OrderType;
  risesAboveSize: string;
  risesAboveTimeInForce: OrderTimeInForce;
  risesAbovePrice?: string;

  expires: boolean;
  expiryStrategy?:
    | 'submit'
    | 'cancel'
    | 'submitfallsBelow'
    | 'submitRisesAbove';
  expiresAt?: string;
};

export const mapInputToStopOrdersSubmission = (
  data: Inputs,
  marketId: string,
  decimalPlaces: number,
  positionDecimalPlaces: number
): StopOrdersSubmission => {
  const submission: StopOrdersSubmission = {};
  if (data.risesAbove) {
    submission.risesAbove = {
      orderSubmission: normalizeOrderSubmission(
        {
          marketId,
          type: data.risesAboveType,
          side: data.side,
          size: data.risesAboveSize,
          timeInForce: data.risesAboveTimeInForce,
          price: data.risesAbovePrice,
          reduceOnly: true,
        },
        decimalPlaces,
        positionDecimalPlaces
      ),
    };
    if (data.risesAboveTrigger === 'price') {
      submission.risesAbove.price = data.risesAboveTriggerPrice;
    } else if (data.risesAboveTrigger === 'trailingPercentOffset') {
      submission.risesAbove.trailingPercentOffset = (
        Number(data.risesAboveTriggerTrailingPercentOffset) / 100
      ).toString();
    }
  }
  if (data.fallsBelow) {
    submission.fallsBelow = {
      orderSubmission: normalizeOrderSubmission(
        {
          marketId,
          type: data.fallsBelowType,
          side: data.side,
          size: data.fallsBelowSize,
          timeInForce: data.fallsBelowTimeInForce,
          price: data.fallsBelowPrice,
          reduceOnly: true,
        },
        decimalPlaces,
        positionDecimalPlaces
      ),
    };
    if (data.fallsBelowTrigger === 'price') {
      submission.fallsBelow.price = data.fallsBelowTriggerPrice;
    } else if (data.fallsBelowTrigger === 'trailingPercentOffset') {
      submission.fallsBelow.trailingPercentOffset = (
        Number(data.fallsBelowTriggerTrailingPercentOffset) / 100
      ).toString();
    }
  }
  if (data.expires) {
    if (data.expiryStrategy === 'cancel') {
      if (submission.fallsBelow) {
        submission.fallsBelow.expiresAt = data.expiresAt;
        submission.fallsBelow.expiryStrategy =
          Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
      } else if (submission.risesAbove) {
        submission.risesAbove.expiresAt = data.expiresAt;
        submission.risesAbove.expiryStrategy =
          Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS;
      }
    } else if (
      (data.expiryStrategy === 'submit' ||
        data.expiryStrategy === 'submitfallsBelow') &&
      submission.fallsBelow
    ) {
      submission.fallsBelow.expiresAt = data.expiresAt;
      submission.fallsBelow.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT;
    } else if (
      (data.expiryStrategy === 'submit' ||
        data.expiryStrategy === 'submitfallsBelow') &&
      submission.risesAbove
    ) {
      submission.risesAbove.expiresAt = data.expiresAt;
      submission.risesAbove.expiryStrategy =
        Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT;
    }
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
          marketData={marketData}
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
  marketData: MarketData;
  submit: (order: StopOrdersSubmission) => void;
}

const StopOrderSetup = ({
  control,
  type,
  trigger,
  side,
  assetSymbol,
}: {
  control: Control<Inputs, never>;
  trigger: 'price' | 'trailingPercentOffset';
  side: 'risesAbove' | 'fallsBelow';
  assetSymbol: string;
  type: Schema.OrderType;
}) => {
  return (
    <fieldset>
      Trigger
      <Controller
        name={`${side}Trigger`}
        control={control}
        render={({ field }) => {
          const { onChange, value } = field;
          return (
            <RadioGroup
              onChange={onChange}
              value={value}
              orientation="horizontal"
            >
              <Radio value="price" id={`${side}TriggerPrice`} label={'Price'} />
              <Radio
                value="trailingPercentOffset"
                id={`${side}TriggerTrailingPercentOffset`}
                label={'Trailing Percent Offset'}
              />
            </RadioGroup>
          );
        }}
      />
      {trigger === 'price' && (
        <Controller
          name={`${side}TriggerPrice`}
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <Input
                type="number"
                onChange={onChange}
                value={value || ''}
                appendElement={assetSymbol}
              />
            );
          }}
        />
      )}
      {trigger === 'trailingPercentOffset' && (
        <Controller
          name={`${side}TriggerTrailingPercentOffset`}
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <Input
                type="number"
                onChange={onChange}
                value={value || ''}
                appendElement="%"
              />
            );
          }}
        />
      )}
      Size
      <Controller
        name={`${side}Size`}
        control={control}
        render={({ field }) => {
          const { onChange, value } = field;
          return (
            <Input type="number" onChange={onChange} value={value || ''} />
          );
        }}
      />
      Type
      <Controller
        name={`${side}Type`}
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
                id={`${side}TypeMarket`}
                label={'Market'}
              />
              <Radio
                value={Schema.OrderType.TYPE_LIMIT}
                id={`${side}TypeLimit`}
                label={'Limit'}
              />
            </RadioGroup>
          );
        }}
      />
      {type === Schema.OrderType.TYPE_LIMIT && (
        <Controller
          name={`${side}Price`}
          control={control}
          render={({ field }) => {
            const { onChange, value } = field;
            return (
              <Input
                type="number"
                onChange={onChange}
                value={value || ''}
                appendElement={assetSymbol}
              />
            );
          }}
        />
      )}
      Time in force
      <Controller
        name={`${side}TimeInForce`}
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
                value={Schema.OrderTimeInForce.TIME_IN_FORCE_IOC}
                id={`${side}TimeInForceIOC`}
                label={'IOC'}
              />
              <Radio
                value={Schema.OrderTimeInForce.TIME_IN_FORCE_FOK}
                id={`${side}TimeInForceFOK`}
                label={'FOK'}
              />
            </RadioGroup>
          );
        }}
      />
    </fieldset>
  );
};

export const StopOrder = ({ market, marketData, submit }: StopOrderProps) => {
  const {
    // register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<Inputs, never>({
    defaultValues: {
      side: Schema.Side.SIDE_SELL,
    },
  });
  const lastSubmitTime = useRef(0);
  const onSubmit = useCallback(
    (data: Inputs) => {
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
  const fallsBelow = watch('fallsBelow');
  const risesAbove = watch('risesAbove');
  const expires = watch('expires');
  const fallsBelowTrigger = watch('fallsBelowTrigger');
  const fallsBelowType = watch('fallsBelowType');
  const risesAboveTrigger = watch('risesAboveTrigger');
  const risesAboveType = watch('risesAboveType');
  const expiryStrategy = watch('expiryStrategy');
  const assetSymbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;
  useCallback(() => {
    if (fallsBelow && risesAbove) {
      if (
        expiryStrategy !== 'submitfallsBelow' &&
        expiryStrategy !== 'submitRisesAbove'
      ) {
        setValue('expiryStrategy', undefined);
      }
    } else {
      if (
        expiryStrategy === 'submitfallsBelow' ||
        expiryStrategy === 'submitRisesAbove'
      ) {
        setValue('expiryStrategy', 'submit');
      }
    }
  }, [fallsBelow, risesAbove, expiryStrategy, setValue]);

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)} className="p-2">
      Side
      <Controller
        name="side"
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
                value={Schema.Side.SIDE_SELL}
                id="sideSell"
                label={'Long'}
              />
              <Radio
                value={Schema.Side.SIDE_BUY}
                id="sideBuy"
                label={'Short'}
              />
            </RadioGroup>
          );
        }}
      />
      <Controller
        name={side !== Schema.Side.SIDE_BUY ? 'fallsBelow' : 'risesAbove'}
        control={control}
        render={({ field }) => {
          const { onChange: onCheckedChange } = field;
          return (
            <Checkbox onCheckedChange={onCheckedChange} label={'Take profit'} />
          );
        }}
      />
      {(side !== Schema.Side.SIDE_BUY ? fallsBelow : risesAbove) && (
        <StopOrderSetup
          control={control}
          trigger={
            side !== Schema.Side.SIDE_BUY
              ? fallsBelowTrigger
              : risesAboveTrigger
          }
          type={side !== Schema.Side.SIDE_BUY ? fallsBelowType : risesAboveType}
          side={side !== Schema.Side.SIDE_BUY ? 'fallsBelow' : 'risesAbove'}
          assetSymbol={assetSymbol}
        />
      )}
      <Controller
        name={side === Schema.Side.SIDE_BUY ? 'fallsBelow' : 'risesAbove'}
        control={control}
        render={({ field }) => {
          const { onChange: onCheckedChange } = field;
          return (
            <Checkbox onCheckedChange={onCheckedChange} label={'Stop loss'} />
          );
        }}
      />
      {(side === Schema.Side.SIDE_BUY ? fallsBelow : risesAbove) && (
        <StopOrderSetup
          control={control}
          trigger={
            side === Schema.Side.SIDE_BUY
              ? fallsBelowTrigger
              : risesAboveTrigger
          }
          type={side === Schema.Side.SIDE_BUY ? fallsBelowType : risesAboveType}
          side={side === Schema.Side.SIDE_BUY ? 'fallsBelow' : 'risesAbove'}
          assetSymbol={assetSymbol}
        />
      )}
      <Controller
        name="expires"
        control={control}
        render={({ field }) => {
          const { onChange: onCheckedChange, value } = field;
          return (
            <Checkbox
              onCheckedChange={onCheckedChange}
              checked={value}
              label={'Set an expiry'}
            />
          );
        }}
      />
      {expires && (
        <fieldset>
          Strategy
          <Controller
            name="expiryStrategy"
            control={control}
            render={({ field }) => {
              const { onChange, value } = field;
              return (
                <RadioGroup onChange={onChange} value={value}>
                  {!(fallsBelow && risesAbove) && (
                    <Radio
                      value="submit"
                      id="expiryStrategySubmit"
                      label={'Submit'}
                    />
                  )}
                  {fallsBelow && risesAbove && (
                    <Radio
                      value="submitfallsBelow"
                      id="expiryStrategySubmitfallsBelow"
                      label={'Submit Rises Above'}
                    />
                  )}
                  {fallsBelow && risesAbove && (
                    <Radio
                      value="submitRisesAbove"
                      id="expiryStrategysubmitRisesAbove"
                      label={'Submit Fall Below'}
                    />
                  )}
                  <Radio
                    value="cancel"
                    id="expiryStrategyCancel"
                    label={'Cancel'}
                  />
                </RadioGroup>
              );
            }}
          />
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
        </fieldset>
      )}
      <input type="submit" />
    </form>
  );
};
