import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimalsFormatNumber,
  formatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  EST_CLOSEOUT_TOOLTIP_TEXT,
  EST_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
} from '../constants';
import { usePartyBalanceQuery } from './__generated__/PartyBalance';
import { useCalculateSlippage } from './use-calculate-slippage';
import { useOrderCloseOut } from './use-order-closeout';
import { useOrderMargin } from './use-order-margin';
import type { OrderMargin } from './use-order-margin';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: MarketDealTicket
) => {
  const { pubKey } = useVegaWallet();

  const slippage = useCalculateSlippage({ marketId: market.id, order });

  const price = useMemo(() => {
    const estPrice = order.price || market.data.markPrice;
    if (estPrice) {
      if (slippage && parseFloat(slippage) !== 0) {
        const isLong = order.side === Schema.Side.SIDE_BUY;
        const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
          parseFloat(slippage) / 100
        );
        return new BigNumber(estPrice).multipliedBy(multiplier).toNumber();
      }
      return order.price;
    }
    return null;
  }, [market.data.markPrice, order.price, order.side, slippage]);

  const estMargin: OrderMargin | null = useOrderMargin({
    order,
    market,
    partyId: pubKey || '',
  });

  const { data: partyBalance } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const estCloseOut = useOrderCloseOut({
    order,
    market,
    partyData: partyBalance,
  });

  const notionalSize = useMemo(() => {
    if (order.price && order.size) {
      return new BigNumber(order.size).multipliedBy(order.price).toString();
    }
    return null;
  }, [order.price, order.size]);

  const quoteName = market.tradableInstrument.instrument.product.quoteName;

  return useMemo(() => {
    return {
      market,
      quoteName,
      notionalSize,
      estMargin,
      estCloseOut,
      slippage,
      price,
      partyData: partyBalance,
    };
  }, [
    market,
    quoteName,
    notionalSize,
    estMargin,
    estCloseOut,
    slippage,
    price,
    partyBalance,
  ]);
};

export interface FeeDetails {
  market: MarketDealTicket;
  quoteName: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
  slippage: string | null;
  price?: string | number | null;
}

export const getFeeDetailsValues = ({
  quoteName,
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
      quoteName,
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
            quoteName={quoteName}
            decimals={assetDecimals}
          />
        </>
      ),
      quoteName,
    },
    {
      label: t('Margin'),
      value:
        estMargin?.margin && `~${formatValueWithAssetDp(estMargin?.margin)}`,
      quoteName,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
    {
      label: t('Liquidation'),
      value: estCloseOut && `~${formatValueWithMarketDp(estCloseOut)}`,
      quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
    },
  ];
};
