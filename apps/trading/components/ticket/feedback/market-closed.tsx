import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import { useT } from '../../../lib/use-t';

export const MarketClosed = ({ marketState }: { marketState: MarketState }) => {
  const t = useT();
  return (
    <p
      className="text-xs text-intent-danger"
      data-testid="feedback-market-closed"
    >
      {t(`This market is {{marketState}} and not accepting orders`, {
        marketState:
          marketState === MarketState.STATE_TRADING_TERMINATED
            ? t('terminated')
            : t(MarketStateMapping[marketState]).toLowerCase(),
      })}
    </p>
  );
};
