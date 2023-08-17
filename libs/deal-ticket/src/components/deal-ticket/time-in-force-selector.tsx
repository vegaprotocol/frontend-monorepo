import {
  TradingFormGroup,
  TradingInputError,
  TradingSelect,
  Tooltip,
  SimpleGrid,
} from '@vegaprotocol/ui-toolkit';
import * as Schema from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import { timeInForceLabel } from '@vegaprotocol/orders';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';

interface TimeInForceSelectorProps {
  value: Schema.OrderTimeInForce;
  orderType: Schema.OrderType;
  onSelect: (tif: Schema.OrderTimeInForce) => void;
  market: Market;
  marketData: StaticMarketData;
  errorMessage?: string;
}

const typeLimitOptions = Object.entries(Schema.OrderTimeInForce);
const typeMarketOptions = typeLimitOptions.filter(
  ([_, timeInForce]) =>
    timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_FOK ||
    timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
);

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
  market,
  marketData,
  errorMessage,
}: TimeInForceSelectorProps) => {
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT
      ? typeLimitOptions
      : typeMarketOptions;

  const renderError = (errorType: string) => {
    if (errorType === MarketModeValidationType.Auction) {
      return t(
        `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
      );
    }

    if (errorType === MarketModeValidationType.LiquidityMonitoringAuction) {
      return (
        <span>
          {t('This market is in auction until it reaches')}{' '}
          <Tooltip
            description={
              <SimpleGrid grid={compileGridData(market, marketData)} />
            }
          >
            <span>{t('sufficient liquidity')}</span>
          </Tooltip>
          {'. '}
          {t(
            `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
          )}
        </span>
      );
    }

    if (errorType === MarketModeValidationType.PriceMonitoringAuction) {
      return (
        <span>
          {t('This market is in auction due to')}{' '}
          <Tooltip
            description={
              <SimpleGrid grid={compileGridData(market, marketData)} />
            }
          >
            <span>{t('high price volatility')}</span>
          </Tooltip>
          {'. '}
          {t(
            `Until the auction ends, you can only place GFA, GTT, or GTC limit orders`
          )}
        </span>
      );
    }

    return null;
  };

  return (
    <TradingFormGroup
      label={t('Time in force')}
      labelFor="select-time-in-force"
      compact={true}
    >
      <TradingSelect
        id="select-time-in-force"
        value={value}
        onChange={(e) => {
          onSelect(e.target.value as Schema.OrderTimeInForce);
        }}
        className="w-full"
        data-testid="order-tif"
        hasError={!!errorMessage}
      >
        {options.map(([key, value]) => (
          <option key={key} value={value}>
            {timeInForceLabel(value)}
          </option>
        ))}
      </TradingSelect>
      {errorMessage && (
        <TradingInputError testId="deal-ticket-error-message-tif">
          {renderError(errorMessage)}
        </TradingInputError>
      )}
    </TradingFormGroup>
  );
};
