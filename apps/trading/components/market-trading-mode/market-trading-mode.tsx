import type { RefObject } from 'react';
import { TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import { useInView } from 'react-intersection-observer';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useStaticMarketData } from '@vegaprotocol/markets';
import { useT } from '../../lib/use-t';

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

interface HeaderStatMarketTradingModeProps {
  marketId?: string;
  onSelect?: (marketId: string, metaKey?: boolean) => void;
  initialTradingMode?: Schema.MarketTradingMode;
  initialTrigger?: Schema.AuctionTrigger;
}

export const HeaderStatMarketTradingMode = ({
  marketId,
  onSelect,
  initialTradingMode,
  initialTrigger,
}: HeaderStatMarketTradingModeProps) => {
  const t = useT();
  const { data } = useStaticMarketData(marketId);
  const marketTradingMode = data?.marketTradingMode ?? initialTradingMode;
  const trigger = data?.trigger ?? initialTrigger;

  return (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        <TradingModeTooltip marketId={marketId} onSelect={onSelect} />
      }
      testId="market-trading-mode"
    >
      <div>{getTradingModeLabel(marketTradingMode, trigger)}</div>
    </HeaderStat>
  );
};

export const MarketTradingMode = ({
  marketId,
  initialTradingMode,
  initialTrigger,
  inViewRoot,
}: Omit<HeaderStatMarketTradingModeProps, 'onUpdate'> & {
  inViewRoot?: RefObject<Element>;
}) => {
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { data } = useStaticMarketData(marketId, !inView);

  return (
    <Tooltip
      description={
        <TradingModeTooltip marketId={marketId} skip={!inView} skipGrid />
      }
    >
      <span ref={ref}>
        {getTradingModeLabel(
          data?.marketTradingMode ?? initialTradingMode,
          data?.trigger ?? initialTrigger
        )}
      </span>
    </Tooltip>
  );
};
