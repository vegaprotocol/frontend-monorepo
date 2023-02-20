import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import type { Market, MarketData } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_CLOSEOUT_TOOLTIP_TEXT,
  EST_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
} from '../constants';
import { useOrderCloseOut } from './use-order-closeout';
import { useOrderMargin } from './use-order-margin';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { useOpenVolume } from '@vegaprotocol/positions';
import { usePendingOrdersVolume } from '@vegaprotocol/orders';
import { useMarketAccountBalance } from '@vegaprotocol/accounts';
import type { OrderMargin } from './use-order-margin';
import { getDerivedPrice } from '../utils/get-price';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: Market,
  marketData: MarketData
) => {
  const { pubKey } = useVegaWallet();
  const openVolume = useOpenVolume(pubKey, market.id);
  const pendingOrderVolume = usePendingOrdersVolume(pubKey, market.id);
  const { accountBalance } = useMarketAccountBalance(market.id);

  const price = useMemo(() => {
    return getDerivedPrice(order, marketData);
  }, [order, marketData]);

  const size = useMemo(() => {
    if (!(openVolume || pendingOrderVolume?.buy || pendingOrderVolume?.sell)) {
      return;
    }
    let size;
    size = BigInt(openVolume || 0);
    const totalBuy =
      BigInt(pendingOrderVolume?.buy || '0') +
      BigInt((order.side === Side.SIDE_BUY && order.size) || 0);
    const totalSell =
      BigInt(pendingOrderVolume?.sell || '0') +
      BigInt((order.side === Side.SIDE_SELL && order.size) || 0);
    const zero = BigInt(0);
    if (size + totalBuy - totalSell > zero) {
      size += totalBuy;
    } else {
      size -= totalSell;
    }
    return size;
  }, [
    openVolume,
    pendingOrderVolume?.buy,
    pendingOrderVolume?.sell,
    order.size,
    order.side,
  ]);

  const estTotalMargin = useOrderMargin({
    side: size && size < 0 ? Side.SIDE_SELL : Side.SIDE_BUY,
    size: size ? size.toString().replace(/^-/, '') : '',
    type: OrderType.TYPE_MARKET,
    timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
    marketId: market.id,
    partyId: pubKey || '',
    price,
  });

  const estMargin = useOrderMargin({
    ...order,
    marketId: market.id,
    partyId: pubKey || '',
    price,
  });

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
      estMargin: estMargin && {
        ...estMargin,
        margin: estTotalMargin?.margin || estMargin?.margin,
      },
      estCloseOut,
    };
  }, [
    market,
    symbol,
    notionalSize,
    estMargin,
    estCloseOut,
    accountBalance,
    estTotalMargin?.margin,
  ]);
};

export interface FeeDetails {
  market: Market;
  symbol: string;
  notionalSize: string | null;
  accountBalance: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
}

export const getFeeDetailsValues = ({
  symbol,
  notionalSize,
  estMargin,
  estCloseOut,
  accountBalance,
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
    {
      label: t('Margin'),
      value:
        estMargin?.margin && `~${formatValueWithAssetDp(estMargin?.margin)}`,
      symbol,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
  ];
  if (accountBalance && estMargin?.margin) {
    details.push({
      label: t('Margin account balance'),
      value: `~${formatValueWithAssetDp(accountBalance)}`,
      symbol,
      labelDescription: MARGIN_ACCOUNT_TOOLTIP_TEXT,
    });
    details.push({
      label: t('Margin difference'),
      value: `~${formatValueWithAssetDp(
        (BigInt(estMargin.margin) - BigInt(accountBalance)).toString()
      )}`,
      symbol,
      labelDescription: MARGIN_DIFF_TOOLTIP_TEXT,
    });
  }
  details.push({
    label: t('Liquidation'),
    value:
      (estCloseOut && `~${formatValueWithMarketDp(estCloseOut)}`) || undefined,
    symbol: market.tradableInstrument.instrument.product.quoteName,
    labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
  });
  return details;
};
