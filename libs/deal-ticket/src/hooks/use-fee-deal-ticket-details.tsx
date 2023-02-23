import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_CLOSEOUT_TOOLTIP_TEXT,
  EST_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
} from '../constants';
import { useCalculateSlippage } from './use-calculate-slippage';
import { useOrderCloseOut } from './use-order-closeout';
import { useOrderMargin } from './use-order-margin';
import type { OrderMargin } from './use-order-margin';
import { getDerivedPrice } from '../utils/get-price';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: Market,
  marketData: MarketData
) => {
  const { pubKey } = useVegaWallet();
  const slippage = useCalculateSlippage({ market, order });

  const derivedPrice = useMemo(() => {
    return getDerivedPrice(order, market, marketData);
  }, [order, market, marketData]);

  // Note this isn't currently used anywhere
  const slippageAdjustedPrice = useMemo(() => {
    if (derivedPrice) {
      if (slippage && parseFloat(slippage) !== 0) {
        const isLong = order.side === Schema.Side.SIDE_BUY;
        const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
          parseFloat(slippage) / 100
        );
        return new BigNumber(derivedPrice).multipliedBy(multiplier).toNumber();
      }
      return derivedPrice;
    }
    return null;
  }, [derivedPrice, order.side, slippage]);

  const estMargin = useOrderMargin({
    order,
    market,
    marketData,
    partyId: pubKey || '',
    derivedPrice,
  });

  const estCloseOut = useOrderCloseOut({
    order,
    market,
    marketData,
  });

  const notionalSize = useMemo(() => {
    if (derivedPrice && order.size) {
      return new BigNumber(order.size)
        .multipliedBy(addDecimal(derivedPrice, market.decimalPlaces))
        .toString();
    }
    return null;
  }, [derivedPrice, order.size, market.decimalPlaces]);

  const assetSymbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  return useMemo(() => {
    return {
      market,
      assetSymbol,
      notionalSize,
      estMargin,
      estCloseOut,
      slippage,
      slippageAdjustedPrice,
    };
  }, [
    market,
    assetSymbol,
    notionalSize,
    estMargin,
    estCloseOut,
    slippage,
    slippageAdjustedPrice,
  ]);
};

export interface FeeDetails {
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
  slippage: string | null;
}

export const getFeeDetailsValues = ({
  assetSymbol,
  notionalSize,
  estMargin,
  estCloseOut,
  market,
}: FeeDetails) => {
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const quoteName = market.tradableInstrument.instrument.product.quoteName;
  const formatValueWithMarketDp = (
    value: string | number | null | undefined
  ): string => {
    return value && !isNaN(Number(value))
      ? formatNumber(value, market.decimalPlaces)
      : '-';
  };
  const formatValueWithAssetDp = (
    value: string | number | null | undefined
  ): string => {
    return value && !isNaN(Number(value))
      ? addDecimalsFormatNumber(value, assetDecimals)
      : '-';
  };
  return [
    {
      label: t('Notional'),
      value: formatValueWithMarketDp(notionalSize),
      symbol: assetSymbol,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT(assetSymbol),
    },
    {
      label: t('Fees'),
      value:
        estMargin?.totalFees &&
        `~${formatValueWithAssetDp(estMargin?.totalFees)}`,
      labelDescription: (
        <>
          <span>
            {t(
              `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}.`
            )}
          </span>

          <FeesBreakdown
            fees={estMargin?.fees}
            feeFactors={market.fees.factors}
            symbol={assetSymbol}
            decimals={assetDecimals}
          />
        </>
      ),
      symbol: assetSymbol,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <span>{t('Margin')} </span>
          <Icon name="chevron-down" size={3} />
        </div>
      ),
      value:
        estMargin?.margin && `~${formatValueWithAssetDp(estMargin?.margin)}`,
      symbol: assetSymbol,
      labelDescription: (
        <>
          <span>{EST_MARGIN_TOOLTIP_TEXT(assetSymbol)}</span>
          <span></span>
          <MarginBreakdown
            marginLevels={estMargin?.marginLevels}
            assetDecimalPlaces={assetDecimals}
            assetSymbol={assetSymbol}
          />
        </>
      ),
    },
    {
      label: t('Liquidation'),
      value: estCloseOut && `~${formatValueWithMarketDp(estCloseOut)}`,
      symbol: quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT(quoteName),
    },
  ];
};

export interface MarginLevels {
  initialLevel?: string;
  searchLevel?: string;
  maintenanceLevel?: string;
  collateralReleaseLevel?: string;
}

export const MarginBreakdown = ({
  marginLevels,
  assetDecimalPlaces,
  assetSymbol,
}: {
  marginLevels?: MarginLevels;
  assetDecimalPlaces: number;
  assetSymbol: string;
}) => {
  if (!marginLevels) return null;
  const formatNumberWithAssetDp = (value: string | number | null | undefined) =>
    value && !isNaN(Number(value))
      ? `${addDecimalsFormatNumber(value, assetDecimalPlaces)} ${assetSymbol}`
      : '-';

  return (
    <dl className="grid grid-cols-2 gap-x-2">
      <Tooltip
        description={t(
          'This is the minimum margin required for a party to place a new order on the network'
        )}
      >
        {<dt>{t('Initial level')}</dt>}
      </Tooltip>
      <dd className="text-right">
        {formatNumberWithAssetDp(marginLevels.initialLevel)}
      </dd>
      <Tooltip
        description={t(
          'If the margin is between maintenance and search, the network will initiate a collateral search'
        )}
      >
        {<dt>{t('Search level')}</dt>}
      </Tooltip>
      <dd className="text-right">
        {formatNumberWithAssetDp(marginLevels.searchLevel)}
      </dd>
      <Tooltip
        description={t(
          'Minimal margin for the position to be maintained in the network'
        )}
      >
        {<dt>{t('Maintenance level')}</dt>}
      </Tooltip>
      <dd className="text-right">
        {formatNumberWithAssetDp(marginLevels.maintenanceLevel)}
      </dd>
      <Tooltip
        description={t(
          'If the margin of the party is greater than this level, then collateral will be released from the margin account into the general account of the party for the given asset.'
        )}
      >
        {<dt>{t('Collateral release level')}</dt>}
      </Tooltip>
      <dd className="text-right">
        {formatNumberWithAssetDp(marginLevels.collateralReleaseLevel)}
      </dd>
    </dl>
  );
};
