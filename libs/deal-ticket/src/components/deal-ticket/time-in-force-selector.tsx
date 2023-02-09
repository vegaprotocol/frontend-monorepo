import { useEffect, useState } from 'react';
import {
  FormGroup,
  NotificationError,
  Select,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import * as Schema from '@vegaprotocol/types';
import { DataGrid, t } from '@vegaprotocol/react-helpers';
import { timeInForceLabel } from '@vegaprotocol/orders';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';

interface TimeInForceSelectorProps {
  value: Schema.OrderTimeInForce;
  orderType: Schema.OrderType;
  onSelect: (tif: Schema.OrderTimeInForce) => void;
  market: MarketDealTicket;
  errorMessage?: string;
}

type OrderType = Schema.OrderType.TYPE_MARKET | Schema.OrderType.TYPE_LIMIT;
type PreviousTimeInForce = {
  [key in OrderType]: Schema.OrderTimeInForce;
};
const DEFAULT_TIME_IN_FORCE: PreviousTimeInForce = {
  [Schema.OrderType.TYPE_MARKET]: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
  [Schema.OrderType.TYPE_LIMIT]: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
};

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
  market,
  errorMessage,
}: TimeInForceSelectorProps) => {
  const options =
    orderType === Schema.OrderType.TYPE_LIMIT
      ? Object.entries(Schema.OrderTimeInForce)
      : Object.entries(Schema.OrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_FOK ||
            timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
        );
  const [previousOrderType, setPreviousOrderType] = useState(
    Schema.OrderType.TYPE_MARKET
  );
  const [previousTimeInForce, setPreviousTimeInForce] =
    useState<PreviousTimeInForce>({
      ...DEFAULT_TIME_IN_FORCE,
      [orderType]: value,
    });

  useEffect(() => {
    if (previousOrderType !== orderType) {
      setPreviousOrderType(orderType);
      const prev = previousTimeInForce[orderType as OrderType];
      onSelect(prev);
    }
  }, [
    onSelect,
    orderType,
    previousTimeInForce,
    previousOrderType,
    setPreviousOrderType,
  ]);

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
              <DataGrid grid={compileGridData(market, market.data)} />
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
              <DataGrid grid={compileGridData(market, market.data)} />
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
    <FormGroup label={t('Time in force')} labelFor="select-time-in-force">
      <Select
        id="select-time-in-force"
        value={value}
        onChange={(e) => {
          setPreviousTimeInForce({
            ...previousTimeInForce,
            [orderType]: e.target.value,
          });
          onSelect(e.target.value as Schema.OrderTimeInForce);
        }}
        className="w-full"
        data-testid="order-tif"
      >
        {options.map(([key, value]) => (
          <option key={key} value={value}>
            {timeInForceLabel(value)}
          </option>
        ))}
      </Select>
      {errorMessage && (
        <NotificationError data-testid="dealticket-error-message-tif">
          {renderError(errorMessage)}
        </NotificationError>
      )}
    </FormGroup>
  );
};
