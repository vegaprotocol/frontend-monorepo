import type { RefObject } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import { useInView } from 'react-intersection-observer';
import * as Schema from '@vegaprotocol/types';
import { useStaticMarketData } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

const getTradingModeLabel = (
  tradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  return (
    (tradingMode === Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    trigger &&
    trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ? `${Schema.MarketTradingModeMapping[tradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`
      : Schema.MarketTradingModeMapping[
          tradingMode as Schema.MarketTradingMode
        ]) || '-'
  );
};

interface HeaderStatMarketTradingModeProps {
  marketId?: string;
  onSelect?: (marketId: string) => void;
  initialTradingMode?: Schema.MarketTradingMode;
  initialTrigger?: Schema.AuctionTrigger;
}

export const HeaderStatMarketTradingMode = ({
  marketId,
  onSelect,
  initialTradingMode,
  initialTrigger,
}: HeaderStatMarketTradingModeProps) => {
  const data = useStaticMarketData(marketId);
  const tradingMode = data?.marketTradingMode ?? initialTradingMode;
  const trigger = data?.trigger ?? initialTrigger;

  return (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        <TradingModeTooltip marketId={marketId} onSelect={onSelect} />
      }
      testId="market-trading-mode"
    >
      <div>{getTradingModeLabel(tradingMode, trigger)}</div>
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
  const data = useStaticMarketData(marketId, !inView);

  return (
    <Tooltip
      description={<TradingModeTooltip marketId={marketId} skip={!inView} />}
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
