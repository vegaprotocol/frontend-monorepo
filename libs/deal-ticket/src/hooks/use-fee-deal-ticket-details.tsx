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

  const symbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  return useMemo(() => {
    return {
      market,
      symbol,
      notionalSize,
      estMargin,
      estCloseOut,
      slippage,
      slippageAdjustedPrice,
    };
  }, [
    market,
    symbol,
    notionalSize,
    estMargin,
    estCloseOut,
    slippage,
    slippageAdjustedPrice,
  ]);
};

export interface FeeDetails {
  market: Market;
  symbol: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
  slippage: string | null;
}

export const getFeeDetailsValues = ({
  symbol,
  notionalSize,
  estMargin,
  estCloseOut,
  market,
}: FeeDetails) => {
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
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
      symbol,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT,
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
              'The most you would be expected to pay in fees, the actual amount may vary.'
            )}
          </span>
          <FeesBreakdown
            fees={estMargin?.fees}
            feeFactors={market.fees.factors}
            symbol={symbol}
            decimals={assetDecimals}
          />
        </>
      ),
      symbol,
    },
    {
      label: t('Margin'),
      value:
        estMargin?.margin && `~${formatValueWithAssetDp(estMargin?.margin)}`,
      symbol,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
    {
      label: t('Liquidation'),
      value: estCloseOut && `~${formatValueWithMarketDp(estCloseOut)}`,
      symbol: market.tradableInstrument.instrument.product.quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
    },
  ];
};
