import {
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';
import { Link as UILink } from '@vegaprotocol/ui-toolkit';
import type { SimpleGridProps } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getAsset, type Market, type MarketData } from '@vegaprotocol/markets';

export const compileGridData = (
  market: Pick<
    Market,
    'id' | 'tradableInstrument' | 'decimalPlaces' | 'positionDecimalPlaces'
  >,
  marketData?: Pick<
    MarketData,
    | 'marketTradingMode'
    | 'auctionStart'
    | 'auctionEnd'
    | 'indicativePrice'
    | 'indicativeVolume'
    | 'suppliedStake'
    | 'targetStake'
    | 'trigger'
  > | null,
  onSelect?: (id: string, metaKey?: boolean) => void
): { label: ReactNode; value?: ReactNode }[] => {
  const grid: SimpleGridProps['grid'] = [];
  const isLiquidityMonitoringAuction =
    (marketData?.marketTradingMode ===
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION &&
      marketData?.trigger ===
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET) ||
    marketData?.trigger ===
      Schema.AuctionTrigger.AUCTION_TRIGGER_UNABLE_TO_DEPLOY_LP_ORDERS;
  const asset = getAsset(market);

  const formatStake = (value: string) => {
    const formattedValue = addDecimalsFormatNumber(value, asset.decimals);
    return `${formattedValue} ${asset.symbol}`;
  };

  if (!marketData) return grid;

  if (marketData.auctionStart) {
    grid.push({
      label: t('Auction start'),
      value: getDateTimeFormat().format(new Date(marketData.auctionStart)),
    });
  }

  if (marketData.auctionEnd) {
    const endDate = getDateTimeFormat().format(new Date(marketData.auctionEnd));
    grid.push({
      label: isLiquidityMonitoringAuction
        ? t('Est. auction end')
        : t('Auction end'),
      value: isLiquidityMonitoringAuction ? `~${endDate}` : endDate,
    });
  }

  if (isLiquidityMonitoringAuction && marketData.targetStake) {
    grid.push({
      label: t('Target liquidity'),
      value: formatStake(marketData.targetStake),
    });
  }

  if (isLiquidityMonitoringAuction && marketData.suppliedStake) {
    grid.push({
      label: (
        <Link
          to={`/liquidity/${market.id}`}
          onClick={(ev) =>
            onSelect && onSelect(market.id, ev.metaKey || ev.ctrlKey)
          }
        >
          <UILink>{t('Current liquidity')}</UILink>
        </Link>
      ),
      value: formatStake(marketData.suppliedStake),
    });
  }
  if (marketData.indicativePrice) {
    grid.push({
      label: t('Est. uncrossing price'),
      value:
        marketData.indicativePrice && marketData.indicativePrice !== '0'
          ? `~
            ${addDecimalsFormatNumber(
              marketData.indicativePrice,
              market.decimalPlaces
            )}`
          : '-',
    });
  }

  if (marketData.indicativeVolume) {
    grid.push({
      label: t('Est. uncrossing vol'),
      value:
        marketData.indicativeVolume && marketData.indicativeVolume !== '0'
          ? '~' +
            addDecimalsFormatNumber(
              marketData.indicativeVolume,
              market.positionDecimalPlaces
            )
          : '-',
    });
  }

  return grid;
};
