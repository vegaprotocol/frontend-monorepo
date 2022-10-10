import {
  t,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { Link as UiToolkitLink } from '@vegaprotocol/ui-toolkit';
import Link from 'next/link';
import { MarketTradingMode, AuctionTrigger } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type { MarketDataGridProps } from './market-data-grid';
import type { DealTicketMarketFragment } from '../deal-ticket/__generated___/DealTicket';

export const compileGridData = (
  market: Omit<DealTicketMarketFragment, 'depth'>,
  onSelect?: (id: string) => void
): { label: ReactNode; value?: ReactNode }[] => {
  const grid: MarketDataGridProps['grid'] = [];
  const isLiquidityMonitoringAuction =
    market.tradingMode === MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
    market.data?.trigger === AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY;

  const formatStake = (value: string) => {
    const formattedValue = addDecimalsFormatNumber(
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
        ? t('Est auction end')
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
        <Link href={`/liquidity/${market.id}`} passHref={true}>
          <UiToolkitLink onClick={() => onSelect && onSelect(market.id)}>
            {t('Current liquidity')}
          </UiToolkitLink>
        </Link>
      ),
      value: formatStake(market.data.suppliedStake),
    });
  }

  if (market.data?.indicativePrice) {
    grid.push({
      label: t('Est uncrossing price'),
      value:
        '~' +
        addDecimalsFormatNumber(
          market.data.indicativePrice,
          market.positionDecimalPlaces
        ),
    });
  }

  if (market.data?.indicativeVolume) {
    grid.push({
      label: t('Est uncrossing vol'),
      value:
        '~' +
        addDecimalsFormatNumber(
          market.data.indicativeVolume,
          market.positionDecimalPlaces
        ),
    });
  }

  return grid;
};
