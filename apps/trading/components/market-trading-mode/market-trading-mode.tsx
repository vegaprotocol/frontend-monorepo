import { t } from '@vegaprotocol/react-helpers';
import { compileGridData, TradingModeTooltip } from '@vegaprotocol/deal-ticket';
import * as Schema from '@vegaprotocol/types';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { MarketX } from '@vegaprotocol/market-list';

interface Props {
  market: MarketX;
  onSelect?: (marketId: string) => void;
  isHeader?: boolean;
}

export const MarketTradingMode = ({
  market,
  onSelect,
  isHeader = false,
}: Props) => {
  if (!market.data) return null;

  const trigger = market.data.trigger;
  const tradingMode = market.data.marketTradingMode;

  const content =
    (tradingMode === Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    trigger &&
    trigger !== Schema.AuctionTrigger.AUCTION_TRIGGER_UNSPECIFIED
      ? `${Schema.MarketTradingModeMapping[tradingMode]} - ${Schema.AuctionTriggerMapping[trigger]}`
      : Schema.MarketTradingModeMapping[
          tradingMode as Schema.MarketTradingMode
        ]) || '-';

  return isHeader ? (
    <HeaderStat
      heading={t('Trading mode')}
      description={
        market && (
          <TradingModeTooltip
            tradingMode={tradingMode}
            trigger={trigger}
            compiledGrid={compileGridData(market, onSelect)}
          />
        )
      }
      testId="market-trading-mode"
    >
      <div>{content}</div>
    </HeaderStat>
  ) : (
    <Tooltip
      description={
        tradingMode &&
        trigger && (
          <TradingModeTooltip tradingMode={tradingMode} trigger={trigger} />
        )
      }
    >
      <span>{content}</span>
    </Tooltip>
  );
};
