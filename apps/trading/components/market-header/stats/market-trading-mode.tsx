import type { RefObject } from 'react';
import { TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import { useInView } from 'react-intersection-observer';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useMarket } from '@vegaprotocol/data-provider';

const getTradingModeLabel = (
  marketTradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  return (
    (marketTradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    trigger &&
    trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ? `${Schema.MarketTradingModeMapping[marketTradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`
      : Schema.MarketTradingModeMapping[
          marketTradingMode as Schema.MarketTradingMode
        ]) || '-'
  );
};

interface MarketTradingModeStatProps {
  marketId?: string;
  onSelect?: (marketId: string, metaKey?: boolean) => void;
}

export const MarketTradingModeStat = ({
  marketId,
  onSelect,
}: MarketTradingModeStatProps) => {
  const t = useT();
  const { data } = useMarket({ marketId });

  return (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        <TradingModeTooltip marketId={marketId} onSelect={onSelect} />
      }
      data-testid="market-trading-mode"
    >
      <div>
        {getTradingModeLabel(
          data?.data?.marketTradingMode,
          data?.data?.trigger
        )}
      </div>
    </HeaderStat>
  );
};

export const MarketTradingMode = ({
  marketId,
  inViewRoot,
}: Omit<MarketTradingModeStatProps, 'onUpdate'> & {
  inViewRoot?: RefObject<Element>;
}) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { data } = useMarket({ marketId });

  return (
    <Tooltip
      description={
        <TradingModeTooltip marketId={marketId} skip={!inView} skipGrid />
      }
    >
      <span ref={ref}>
        {getTradingModeLabel(
          data?.data?.marketTradingMode,
          data?.data?.trigger
        )}
      </span>
    </Tooltip>
  );
};
