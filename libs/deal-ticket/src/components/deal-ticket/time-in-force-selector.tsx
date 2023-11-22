import {
  TradingFormGroup,
  TradingInputError,
  TradingSelect,
  TextChildrenTooltip as Tooltip,
  SimpleGrid,
} from '@vegaprotocol/ui-toolkit';
import * as Schema from '@vegaprotocol/types';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { Trans } from 'react-i18next';
import { useT, ns } from '../../use-t';

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
  const t = useT();
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT
      ? typeLimitOptions
      : typeMarketOptions;

  const renderError = (errorType: string) => {
    if (errorType === MarketModeValidationType.Auction) {
      return t(
        'Until the auction ends, you can only place GFA, GTT, or GTC limit orders'
      );
    }

    if (errorType === MarketModeValidationType.LiquidityMonitoringAuction) {
      return (
        <span>
          <Trans
            i18nKey="TIME_IN_FORCE_SELECTOR_LIQUIDITY_MONITORING_AUCTION"
            defaults="This market is in auction until it reaches <0>sufficient liquidity</0>. Until the auction ends, you can only place GFA, GTT, or GTC limit orders."
            ns={ns}
            components={[
              <Tooltip
                description={
                  <SimpleGrid grid={compileGridData(t, market, marketData)} />
                }
              >
                sufficient liquidity
              </Tooltip>,
            ]}
            t={t}
          />
        </span>
      );
    }

    if (errorType === MarketModeValidationType.PriceMonitoringAuction) {
      return (
        <span>
          <Trans
            i18nKey="TIME_IN_FORCE_SELECTOR_PRICE_MONITORING_AUCTION"
            defaults="This market is in auction due to <0>high price volatility</0>. Until the auction ends, you can only place GFA, GTT, or GTC limit orders."
            ns={ns}
            components={[
              <Tooltip
                description={
                  <SimpleGrid grid={compileGridData(t, market, marketData)} />
                }
              >
                high price volatility
              </Tooltip>,
            ]}
            t={t}
          />
        </span>
      );
    }

    return null;
  };

  return (
    <div className="mb-4">
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
            <TimeInForceOption key={key} value={value} />
          ))}
        </TradingSelect>
        {errorMessage && (
          <TradingInputError testId="deal-ticket-error-message-tif">
            {renderError(errorMessage)}
          </TradingInputError>
        )}
      </TradingFormGroup>
    </div>
  );
};

const TimeInForceOption = ({ value }: { value: Schema.OrderTimeInForce }) => {
  const t = useT();
  return <option value={value}>{t(value)}</option>;
};
