import { Lozenge, Tooltip } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';

import * as Schema from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';

import { Indicator } from '../indicator';

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
  const tooltipDescription = t(getTooltipDescription(status));

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

const getTooltipDescription = (status: string) => {
  let tooltipDescription = '';
  switch (status) {
    case Schema.MarketTradingModeMapping.TRADING_MODE_CONTINUOUS:
      tooltipDescription =
        'This is the standard trading mode where trades are executed whenever orders are received';
      break;
    case `${Schema.MarketTradingModeMapping.TRADING_MODE_MONITORING_AUCTION} - ${Schema.AuctionTriggerMapping.AUCTION_TRIGGER_LIQUIDITY}`:
      tooltipDescription =
        'This market is in auction until it reaches sufficient liquidity';
      break;
    case Schema.MarketTradingModeMapping.TRADING_MODE_OPENING_AUCTION:
      tooltipDescription =
        'This is a new market in an opening auction to determine a fair mid-price before starting continuous trading.';
      break;
    default:
      break;
  }

  return tooltipDescription;
};
