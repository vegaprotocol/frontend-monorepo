import { Lozenge, Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';

import * as Schema from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';

import { Indicator } from '../indicator';
import type { AuctionTrigger } from '@vegaprotocol/types';

export const Status = ({
  tradingMode,
  trigger,
  size = 'small',
}: {
  tradingMode?: Schema.MarketTradingMode;
  trigger?: Schema.AuctionTrigger;
  size?: 'small' | 'large';
}) => {
  const getStatus = () => {
    if (!tradingMode) return '';
    if (
      tradingMode === Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION
    ) {
      if (
        trigger &&
        trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ) {
        return `${Schema.MarketTradingModeMapping[tradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`;
      }
    }
    return Schema.MarketTradingModeMapping[tradingMode];
  };

  const status = getStatus();
  const tooltipDescription =
    tradingMode && getTooltipDescription(tradingMode, trigger);

  return (
    <div>
      <Tooltip description={tooltipDescription}>
        <div
          className={classNames('inline-flex whitespace-normal', {
            'text-base': size === 'large',
            'text-sm': size === 'small',
          })}
        >
          <Lozenge className="border border-greys-light-300 bg-greys-light-100 flex items-center">
            <Indicator status={tradingMode} />
            {status}
          </Lozenge>
        </div>
      </Tooltip>
    </div>
  );
};

const getTooltipDescription = (
  status: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  switch (status) {
    case Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS:
      return t(
        'This is the standard trading mode where trades are executed whenever orders are received'
      );
    case Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION:
      return getMonitoringDescriptionTooltip(trigger);
    case Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION:
      return t(
        'This is a new market in an opening auction to determine a fair mid-price before starting continuous trading.'
      );
    default:
      return '';
  }
};

const getMonitoringDescriptionTooltip = (trigger?: AuctionTrigger) => {
  switch (trigger) {
    case Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET:
      return t(
        `This market is in auction until it reaches sufficient liquidity.`
      );
    case Schema.AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS:
      return t(
        `This market may have sufficient liquidity but there are not enough priced limit orders in the order book, which are required to deploy liquidity commitment pegged orders.`
      );
    case Schema.AuctionTrigger.AUCTION_TRIGGER_PRICE:
      return t(`This market is in auction due to high price volatility.`);
    case Schema.AuctionTrigger.AUCTION_TRIGGER_OPENING:
      return t(
        `This is a new market in an opening auction to determine a fair mid-price before starting continuous trading`
      );
    default:
      return '';
  }
};
