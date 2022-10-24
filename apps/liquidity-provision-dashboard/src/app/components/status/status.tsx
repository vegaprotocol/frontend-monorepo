import { Lozenge } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';

import {
  MarketTradingModeMapping,
  MarketTradingMode,
  AuctionTrigger,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';

export const Status = ({
  tradingMode,
  trigger,
  size = 'small',
}: {
  tradingMode?: MarketTradingMode;
  trigger?: AuctionTrigger;
  size?: 'small' | 'large';
}) => {
  const getStatus = () => {
    if (!tradingMode) return '';
    if (tradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION) {
      if (trigger && trigger !== AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED) {
        return `${MarketTradingModeMapping[tradingMode]} - ${AuctionTriggerMapping[trigger]}`;
      }
    }
    return MarketTradingModeMapping[tradingMode];
  };

  return (
    <div
      className={classNames('inline-flex whitespace-normal', {
        'text-base': size === 'large',
        'text-sm': size === 'small',
      })}
    >
      <Lozenge className="border border-[#a7a7a7] bg-[#f0f0f0]">
        {getStatus()}
      </Lozenge>
    </div>
  );
};
