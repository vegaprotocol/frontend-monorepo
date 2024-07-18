import { MarketTradingMode } from '@vegaprotocol/types';
import { useT } from '../../../lib/use-t';

export const MarketAuction = ({
  marketTradingMode,
}: {
  marketTradingMode: MarketTradingMode;
}) => {
  const t = useT();
  let msg = null;

  if (marketTradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION) {
    msg = (
      <p
        className="text-xs text-warning"
        data-testid="feedback-market-monitoring-auction"
      >
        {t(
          'This market is in auction due to high price volatility. Until the auction ends, you can only place GFA, GTT, or GTC limit orders.'
        )}
      </p>
    );
  }

  if (marketTradingMode === MarketTradingMode.TRADING_MODE_OPENING_AUCTION) {
    msg = (
      <p
        className="text-xs text-warning"
        data-testid="feedback-market-opening-auction"
      >
        {t(
          'This is a new market in an opening auction to determine a fair mid-price before starting continuous trading.'
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {msg}
      <p className="text-xs text-warning" data-testid="feedback-market-auction">
        {t('Any orders placed now will not trade until the auction ends')}
      </p>
    </div>
  );
};
