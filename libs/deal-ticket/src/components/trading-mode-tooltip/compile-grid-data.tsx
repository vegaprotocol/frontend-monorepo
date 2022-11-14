import {
  t,
  getDateTimeFormat,
  addDecimalsNormalizeNumber,
} from '@vegaprotocol/react-helpers';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import { Link as UILink } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import type { MarketDataGridProps } from './market-data-grid';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated__/DealTicket';
import { Link } from 'react-router-dom';

export const compileGridData = (
  market: Omit<DealTicketMarketFragment, 'depth'>,
  onSelect?: (id: string) => void
): { label: ReactNode; value?: ReactNode }[] => {
  const grid: MarketDataGridProps['grid'] = [];
  const isLiquidityMonitoringAuction =
    market.tradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

  const formatStake = (value: string) => {
    const formattedValue = addDecimalsNormalizeNumber(
      value,
      market.tradableInstrument.instrument.product.settlementAsset.decimals
    );
    const asset =
      market.tradableInstrument.instrument.product.settlementAsset.symbol;
    return `${formattedValue} ${asset}`;
  };

  if (!market.data) return grid;

  if (market.data?.auctionStart) {
    grid.push({
      label: t('Auction start'),
      value: getDateTimeFormat().format(new Date(market.data.auctionStart)),
    });
  }

  if (market.data?.auctionEnd) {
    const endDate = getDateTimeFormat().format(
      new Date(market.data.auctionEnd)
    );
    grid.push({
      label: isLiquidityMonitoringAuction
        ? t('Est. auction end')
        : t('Auction end'),
      value: isLiquidityMonitoringAuction ? `~${endDate}` : endDate,
    });
  }

  if (isLiquidityMonitoringAuction && market.data?.targetStake) {
    grid.push({
      label: t('Target liquidity'),
      value: formatStake(market.data.targetStake),
    });
  }

  if (isLiquidityMonitoringAuction && market.data?.suppliedStake) {
    grid.push({
      label: (
        <Link
          to={`/liquidity/${market.id}`}
          onClick={() => onSelect && onSelect(market.id)}
        >
          <UILink>{t('Current liquidity')}</UILink>
        </Link>
      ),
      value: formatStake(market.data.suppliedStake),
    });
  }
  if (market.data?.indicativePrice) {
    grid.push({
      label: t('Est. uncrossing price'),
      value:
        market.data.indicativePrice && market.data.indicativePrice !== '0'
          ? `~
            ${addDecimalsNormalizeNumber(
              market.data.indicativePrice,
              market.decimalPlaces
            )}`
          : '-',
    });
  }

  if (market.data?.indicativeVolume) {
    grid.push({
      label: t('Est. uncrossing vol'),
      value:
        market.data.indicativeVolume && market.data.indicativeVolume !== '0'
          ? '~' +
            addDecimalsNormalizeNumber(
              market.data.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
    });
  }

  return grid;
};
