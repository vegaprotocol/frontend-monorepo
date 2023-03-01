import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  t,
  toBigNum,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_CLOSEOUT_TOOLTIP_TEXT,
  // EST_MARGIN_TOOLTIP_TEXT,
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
} from '../constants';
import { useOrderCloseOut } from './use-order-closeout';
import { useOrderMargin } from './use-order-margin';
import { volumeAndMarginProvider } from '@vegaprotocol/positions';
import { useMarketAccountBalance } from '@vegaprotocol/accounts';
import type { OrderMargin } from './use-order-margin';
import { getDerivedPrice } from '../utils/get-price';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: Market,
  marketData: MarketData
) => {
  const { pubKey } = useVegaWallet();
  const { data: activeVolumeAndMargin } = useDataProvider({
    dataProvider: volumeAndMarginProvider,
    variables: { marketId: market.id, partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { accountBalance } = useMarketAccountBalance(market.id);

  const price = useMemo(() => {
    return getDerivedPrice(order, marketData);
  }, [order, marketData]);

  const estMargin = useOrderMargin({
    ...order,
    marketId: market.id,
    partyId: pubKey || '',
    price,
  });

  if (activeVolumeAndMargin && estMargin) {
    let sellMargin = BigInt(activeVolumeAndMargin.sellInitialMargin);
    let buyMargin = BigInt(activeVolumeAndMargin.buyInitialMargin);
    const margin = BigInt(estMargin.margin);
    if (order.side === Side.SIDE_SELL) {
      activeVolumeAndMargin.sellVolume = (
        BigInt(activeVolumeAndMargin.sellVolume) + BigInt(order.size)
      ).toString();
      sellMargin += margin;
    } else {
      buyMargin += margin;
    }
    estMargin.margin =
      sellMargin > buyMargin ? sellMargin.toString() : buyMargin.toString();
  }

  const estCloseOut = useOrderCloseOut({
    order,
    market,
    marketData,
  });

  const notionalSize = useMemo(() => {
    if (price && order.size) {
      return toBigNum(order.size, market.positionDecimalPlaces)
        .multipliedBy(addDecimal(price, market.decimalPlaces))
        .toString();
    }
    return null;
  }, [price, order.size, market.decimalPlaces, market.positionDecimalPlaces]);

  const symbol =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  return useMemo(() => {
    return {
      market,
      symbol,
      notionalSize,
      accountBalance,
      estMargin: estMargin,
      estCloseOut,
    };
  }, [market, symbol, notionalSize, estMargin, estCloseOut, accountBalance]);
};

export interface FeeDetails {
  balance: string;
  estCloseOut: string | null;
  estMargin: OrderMargin | null;
  margin: string;
  market: Market;
  notionalSize: string | null;
  symbol: string;
  totalMargin: string;
}

export const getFeeDetailsValues = ({
  balance,
  estCloseOut,
  estMargin,
  margin,
  market,
  notionalSize,
  symbol,
  totalMargin,
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
  const details = [
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
    /*{
      label: t('Margin'),
      value: margin && `~${formatValueWithAssetDp(margin)}`,
      symbol,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },*/
    {
      label: t('Margin required'),
      value: `~${formatValueWithAssetDp(
        balance
          ? (BigInt(totalMargin) - BigInt(balance)).toString()
          : totalMargin
      )}`,
      symbol,
      labelDescription: MARGIN_DIFF_TOOLTIP_TEXT + ' (' + symbol + ').',
    },
  ];
  if (balance) {
    details.push({
      label: t('Projected margin'),
      value: `~${formatValueWithAssetDp(totalMargin)}`,
      symbol,
      labelDescription: EST_TOTAL_MARGIN_TOOLTIP_TEXT,
    });
  }
  details.push({
    label: t('Current margin allocation'),
    value: balance
      ? `~${formatValueWithAssetDp(balance)}`
      : `${formatValueWithAssetDp(balance)}`,
    symbol,
    labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
  });
  details.push({
    label: t('Liquidation'),
    value: (estCloseOut && `~${formatValueWithMarketDp(estCloseOut)}`) || '',
    symbol: market.tradableInstrument.instrument.product.quoteName,
    labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
  });
  return details;
};
